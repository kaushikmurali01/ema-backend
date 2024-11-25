const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect("mongodb+srv://kaushikmuralig:Megaepik12@cluster0.cmoap.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas and Models
const facilitatorSchema = new mongoose.Schema({ name: String });
const Facilitator = mongoose.model("Facilitator", facilitatorSchema);

const emaScoreSchema = new mongoose.Schema({
  facilityId: String,
  category: String,
  score: Number,
});
const EMAScore = mongoose.model("EMAScore", emaScoreSchema);

const questionSchema = new mongoose.Schema({
  category: String,
  question: String,
  priority: Number,
  recommendation: String,
  order: Number,
});
const Question = mongoose.model("Question", questionSchema);

// Facilitators
app.get("/facilitators", async (req, res) => {
  const facilitators = await Facilitator.find();
  res.json(facilitators);
});

app.post("/facilitators", async (req, res) => {
  const facilitator = new Facilitator(req.body);
  await facilitator.save();
  res.json(facilitator);
});

app.delete("/facilitators/:id", async (req, res) => {
  const { id } = req.params;
  await Facilitator.findByIdAndDelete(id);
  res.sendStatus(204);
});

// EMA Scores
app.get("/ema-scores", async (req, res) => {
  const scores = await EMAScore.find();
  res.json(scores);
});

app.post("/ema-scores", async (req, res) => {
  const { facilityId, category, score } = req.body;
  const existingScore = await EMAScore.findOne({ facilityId, category });

  if (existingScore) {
    // Update existing score
    existingScore.score = score;
    await existingScore.save();
    res.json(existingScore);
  } else {
    // Create new score
    const emaScore = new EMAScore({ facilityId, category, score });
    await emaScore.save();
    res.json(emaScore);
  }
});

app.delete("/ema-scores/:id", async (req, res) => {
  const { id } = req.params;
  await EMAScore.findByIdAndDelete(id);
  res.sendStatus(204);
});

// Questions
app.get("/questions", async (req, res) => {
  const questions = await Question.find().sort({ order: 1 });
  res.json(questions);
});

app.post("/questions", async (req, res) => {
  const count = await Question.countDocuments();
  const question = new Question({ ...req.body, order: count + 1 });
  await question.save();
  res.json(question);
});

app.put("/questions/reorder", async (req, res) => {
  const { updates } = req.body; // Expecting an array of { id, order }
  const bulkOps = updates.map((update) => ({
    updateOne: {
      filter: { _id: update.id },
      update: { order: update.order },
    },
  }));
  await Question.bulkWrite(bulkOps);
  res.sendStatus(200);
});

app.delete("/questions/:id", async (req, res) => {
  const { id } = req.params;
  await Question.findByIdAndDelete(id);
  res.sendStatus(204);
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

