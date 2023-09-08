const http = require("http");
const { default: mongoose } = require("mongoose");
const { Server } = require("socket.io");
const httpServer = http.createServer();
const dotenv = require("dotenv");
const DocumentModel= require("./models/Document");

dotenv.config();

async function connectToMongoDB() {
  try {
    await mongoose
      .connect(process.env.DATABASE_URL)
      .then(() => console.log("Connected! to Database "))
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
async function findOrCreate(id) {
  console.log(id,"id");
  if (!id) return;
  const document = await DocumentModel.findById(id);
  if (document) return document;
  return await DocumentModel.create({ _id: id, data: "" });
}

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000", // Replace with your frontend URL
    methods: ["GET", "POST"],
    // allowedHeaders: ["my-custom-header"],
    // credentials: true,
  },
});

io.on("connection", (socket) => {
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreate(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);
    socket.on("save-document", async (data) => {
      await DocumentModel.findByIdAndUpdate(documentId, { data });
    });
    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  connectToMongoDB();
  console.log(`Socket.io server is running on port ${PORT}`);
});
