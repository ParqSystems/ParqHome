let io;

const initIO = (server)=>{
    const { Server } = require("socket.io");

    io = new Server(server, {
        cors: {
            origin: "*"
        }
    });

    io.on("connection", (socket) => {
        console.log("Client is connected to socket with ID : " + socket.id);
        
        socket.on("disconnect", () => {
            console.log("Client disconnected from socket with ID : " + socket.id);
        });

    });

    return io;
}


const getIO = () => {
    if (!io) {
        throw new Error("Socket.io was not initialized");
    }
    return io;
}


module.exports = { initIO, getIO };