const mqtt = require("mqtt");
const client = mqtt.connect("mqtts://4e3fe38828204ed2887d34fe15744691.s1.eu.hivemq.cloud:8883", {
    username: "ParqHome_Software",
    password:"ParqHome_Software@123"
});    //get broker ID from Nikhil
const Switch = require("./Models/Switch");
const { getIO } = require("./socket.js");


client.on("connect", () => {
    console.log("Connected to MQTT");

    client.subscribe("home/ui/status", (error) => {
        if (error) {
            console.log("MQTT subscription error : ");
            console.log(error);
        }
        else {
            console.log("Subscribed to MQTT publisher successfully");
        }
    });
});


client.on("message", async (topic, message) => {
    try {
        const data = JSON.parse(message.toString());
        console.log("MQTT message received : ");
        console.log(data);

        //update database
        const { source, familyId, switchId, ...updates } = data;

        if (source === "app") {
            return;
        }

        const foundSwitches = await Switch.findOne({ familyId });
        if (!foundSwitches) {
            return;
        }

        const sw = foundSwitches.switches.find(s => String(s.switchId) === String(switchId));

        if (sw) {
            Object.assign(sw, updates);
            await foundSwitches.save();

            const io = getIO();
            io.emit("switchUpdate", {
                familyId,
                switchId,
                ...updates
            });
        }
    }
    catch (error) {
        console.log("MQTT error : ");
        console.log(error);
    }
});


module.exports = client;