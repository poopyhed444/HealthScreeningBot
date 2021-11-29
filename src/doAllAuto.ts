import {Client, TextChannel, User} from "discord.js"
import {Config} from "./orm"


import {getScreenshotData, GetScreenshotDataReturnType} from "./getScreenshotData";
import {DateTime} from "luxon";

async function actOnItem(client, item, manual) {
    try {
        // @ts-ignore
        const user: User = await client.users.fetch(item);
        if (manual) {
            await user.send("**The auto health screening has been *manually triggered* by the bot owner, most likely for testing.**")
        }
        let data = await getScreenshotData(item);
        switch (data.type) {
            case GetScreenshotDataReturnType.success:
                const trueData = data.data;
                Object.assign(trueData, {
                    sendable: {type: GenerateScreenshotSendableTypeType.user, user: user},
                    isAuto: true
                })
                try {
                    return await produceScreenshot(trueData);
                } catch (e) {
                    await user.send("The bot had an error while trying to process your health screening. You most likely specified invalid data. Please generate a new health screening using `/generate_once`.")
                }
                return;
        }
    } catch (e) {
        console.error(e)
        throw e;
    }
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


export async function doAllAuto(client: Client, manual: boolean = false) {
    const items = await Config.findAll()
    const validUserIDs = new Set()
    for (const [, guild] of client.guilds.cache) {
        for (const [userId] of await guild.members.fetch()){
            validUserIDs.add(userId);
        }
    }
    // @ts-ignore
    const validItems = items.filter(item => validUserIDs.has(item.userId))
    const batchSize = 4;
    const batches = Math.ceil(validItems.length / batchSize)
    let batchTimeConsumedMillis = 0;
    let batchesConsumed = 0;
    // @ts-ignore
    const channel: TextChannel = await ((await client.guilds.fetch("889983763994521610")).channels.fetch("902375187150934037"));
    let toDo = [], start, finish, globalStart = DateTime.local({locale: "en_US", zone: "America/New_York"}).toMillis();
    await channel.send(`Starting automatic health screening\n\nBatches: **${batches}**\nScreenings: **${validItems.length}**`);
    try {
    for (const item of validItems) {
        // @ts-ignore
        if (!validUserIDs.has(item.userId)){
            continue;
        }
        // @ts-ignore
        toDo.push(item.userId)
        if (toDo.length === batchSize) {
            start = DateTime.local({locale: "en_US", zone: "America/New_York"}).toMillis()
            while (semaphore.isLocked()) {
                await sleep(1000);
            }
            let noun = "complete";
            try {
                await Promise.all(toDo.map((value => actOnItem(client, value, manual))))
            } catch (e) {
                noun = "error";
            }
            finish = DateTime.local({locale: "en_US", zone: "America/New_York"}).toMillis() - start
            batchesConsumed++;
            batchTimeConsumedMillis += finish
            if (batchesConsumed != batches) {
                const elapsedSeconds = finish / 1000;
                const averageTime = batchTimeConsumedMillis / batchesConsumed;
                const remainingTimeLeft = Math.ceil((averageTime * (batches - batchesConsumed)) / 1000);
                const remainingTimeAsTimestamp = Math.ceil(DateTime.local({
                    locale: "en_US",
                    zone: "America/New_York"
                }).toSeconds() + remainingTimeLeft) // This is basically the timestamp `remainingTimeLeft` seconds into the future.
                const completedPercent = +(((batchesConsumed / batches) * 100).toFixed(2))
                await channel.send(`Batch ${batchesConsumed}/${batches} ${noun} [${batchesConsumed * batchSize}/${validItems.length} screenings] [${completedPercent}%] (took ${elapsedSeconds} seconds) [ETA: <t:${remainingTimeAsTimestamp}:T> (<t:${remainingTimeAsTimestamp}:R>)]`)
            }
            toDo = []
        }
        }
    } catch (e) {
        console.error(e)
        await channel.send("Error while doing auto screenings in the global loop. Aborting.")
        return;
    }
    if (toDo.length > 0) {
        while (semaphore.isLocked()) {
            await sleep(1000);
        }
        await Promise.all(toDo.map((value => actOnItem(client, value, manual))))
    }
    const finalFinished = DateTime.local({locale: "en_US", zone: "America/New_York"}).toMillis()
    await channel.send(`All screenings complete. Total time elapsed: ${parseMillisecondsIntoReadableTime(finalFinished - globalStart)}`)
}