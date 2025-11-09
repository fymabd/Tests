
import { fork } from "child_process";

console.log("Starting all bots...");

// تشغيل البوت الأول
const bot1 = fork("./otman.js");
bot1.on("error", (err) => console.error("Bot 1 Error:", err));
bot1.on("exit", (code) => console.log(`Bot 1 exited with code ${code}`));

// يمكنك إضافة بوتات أخرى بنفس الطريقة:
const bot2 = fork("./anas.js");
 bot2.on("error", (err) => console.error("Bot 2 Error:", err));
 bot2.on("exit", (code) => console.log(`Bot 2 exited with code ${code}`)); 

console.log("All bots started successfully!");
