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

app.post("/reset-questions", async (req, res) => {
  try {
    // Step 1: Delete all existing questions
    await Question.deleteMany();

    // Step 2: Insert the new set of questions
    const data = req.body; // Expect the new question set in the request body

    // Flattening the data to insert individual questions
    const questionsToInsert = [];
    data.forEach((categoryData) => {
      categoryData.questions.forEach((question) => {
        questionsToInsert.push({
          category: categoryData.category,
          question: question.question,
          priority: question.priority,
          recommendation: question.recommendation,
          order: questionsToInsert.length + 1,
        });
      });
    });

    // Bulk insert the questions
    await Question.insertMany(questionsToInsert);

    res.status(200).json({ message: "Questions reset successfully!" });
  } catch (error) {
    console.error("Error resetting questions:", error);
    res.status(500).json({ error: "An error occurred while resetting questions." });
  }
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});


// const resetQuestions = async () => {
//   const data = [
//     {
//       category: "Management Commitment",
//       description:
//         "Assessment of the level of executive involvement in promoting and deploying energy management in your organization.",
//       questions: [
//         {
//           question:
//             "Our management has expressed verbal support for energy management.",
//           recommendation:
//             "Engage with your management team to develop support for improving your energy performance.",
//           priority: 1,
//         },
//         {
//           question:
//             "Our management has a written commitment (e.g. charter, policy or directive) to improve energy performance, that has been shared with employees and other relevant individuals who occupy our facility.",
//           recommendation:
//             "Engage with your management team to develop a written commitment to improve energy efficiency, and to share it with all relevant parties at the facility.",
//           priority: 2,
//         },
//         {
//           question:
//             "Our management allocates necessary resources (financial, human, technological) for implementing and maintaining the Energy Management Information System (EMIS).",
//           recommendation:
//             "To effectively implement an Energy Management Information System (EMIS), management must allocate necessary financial, human, and technological resources.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have an energy policy that specifies guiding principles for energy management (e.g. continuous improvement).",
//           recommendation:
//             "Create an energy management policy that focuses on continuous improvement.",
//           priority: 3,
//         },
//         {
//           question: "Our energy policy is reviewed and updated regularly.",
//           recommendation:
//             "Review and update the energy management policy regularly.",
//           priority: 3,
//         },
//         {
//           question:
//             "Our energy policy includes a commitment to purchase energy efficient products and services.",
//           recommendation:
//             "Include in the energy management policy a commitment to purchase energy efficient goods and services.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our written energy policy has been communicated to staff at all levels within our organization.",
//           recommendation:
//             "Engage with your company team to ensure that the energy management policy has been communicated to all employees.",
//           priority: 4,
//         },
//         {
//           question:
//             "Top management ensures that our energy policy provides a framework for both setting and achieving goals.",
//           recommendation:
//             "Engage with your management team to develop a framework for both setting and achieving goals.",
//           priority: 4,
//         },
//         {
//           question:
//             "We have identified and documented who must participate in the management review.",
//           recommendation:
//             "Clearly define and document required participants for management reviews to ensure consistent, comprehensive EMIS evaluation.",
//           priority: 5,
//         },
//         {
//           question:
//             "We maintain comprehensive records of all management reviews.",
//           recommendation:
//             "Implement a robust system to record all management review outcomes, ensuring traceability and facilitating continuous improvement of the EMIS.",
//           priority: 5,
//         },
//         {
//           question:
//             "A senior executive has energy management in their performance goals.",
//           recommendation:
//             "Engage with your senior management team to include energy management in their performance goals.",
//           priority: 5,
//         },
//         {
//           question:
//             "A senior executive regularly communicates with our executive team on our energy performance and provides updates on our energy management program.",
//           recommendation:
//             "Engage with your senior management team to ensure regular updates on energy performance and the energy management policy are provided to the executive team.",
//           priority: 5,
//         },
//         {
//           question:
//             "Our top management has committed to long term energy goals (at least 3 years out) that are appropriate to our organization’s savings potential.",
//           recommendation:
//             "Engage with your senior management team to set long term energy goals (at least 3 years out) that are appropriate to our organization’s savings potential.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Resources",
//       description:
//         "Assessment of your organization’s current financial and human resources as required for energy management, including budgets and energy teams.",
//       questions: [
//         {
//           question:
//             "We have at least one individual tasked with improving our energy performance as part of their role (with or without formal responsibilities).",
//           recommendation:
//             "Assign at least one staff member responsibility for energy performance within your organization, as part of their role.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have an individual or team with formal responsibility for our energy performance/management.",
//           recommendation:
//             "Assign at least one staff member responsibility for energy performance within your organization, as part of their role.",
//           priority: 2,
//         },
//         {
//           question:
//             "We provide a limited number of trainings to staff in energy management (in-house or external).",
//           recommendation:
//             "Provide training to staff on energy management, either in-house or externally.",
//           priority: 2,
//         },
//         {
//           question:
//             "Allocated specific technical resources (e.g., monitoring equipment, software) for energy data collection and analysis.",
//           recommendation:
//             "To ensure effective energy management, allocate specific technical resources such as monitoring equipment and software for accurate energy data collection and analysis.",
//           priority: 2,
//         },
//         {
//           question:
//             "Identified and engaged external expertise (e.g., consultants, specialists) when necessary for energy management activities.",
//           recommendation:
//             "Leverage external expertise (consultants, specialists) to complement internal capabilities and enhance energy management effectiveness, particularly for complex or specialized energy initiatives.",
//           priority: 2,
//         },
//         {
//           question:
//             "We have an energy team that meets at least monthly and has allocated resources for at least the next 12 months of energy performance improvements.",
//           recommendation:
//             "Form an energy team that meets at least monthly and allocate resources for at least the next 12 months of energy performance improvements.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have evaluated the capability of key staff responsible for our energy performance (e.g. training and experience in the operation of large energy systems).",
//           recommendation:
//             "Evaluate the capabilities of key staff responsible for your energy performance and identify if and where training is required.",
//           priority: 3,
//         },
//         {
//           question:
//             "Our management has formally appointed an energy champion and team to manage our Strategic Energy Management (SEM) program implementation.",
//           recommendation:
//             "Engage with your management to formally appoint an energy champion and team to manage your SEM program implementation.",
//           priority: 4,
//         },
//         {
//           question:
//             "Staff operating large energy systems have been trained and take action to improve our energy performance as documented in our SEM program (e.g. HVAC, chillers, boilers etc.).",
//           recommendation:
//             "Ensure all staff operating large energy systems have been trained to take action to improve your energy performance based on your SEM program.",
//           priority: 4,
//         },
//         {
//           question:
//             "Top management has allocated the resources needed to establish, implement, and improve our SEM program and energy performance.",
//           recommendation:
//             "Engage with your senior management team to allocate the resources needed to establish, implement, and improve your SEM program and energy performance.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our organization provides formal training in energy management to all relevant staff and maintains records of training conducted.",
//           recommendation:
//             "Provide training to staff on energy management and ensure records are kept.",
//           priority: 5,
//         },
//         {
//           question:
//             "Sufficient resources have been formally allocated to meet our energy performance targets.",
//           recommendation: "",
//           priority: 5,
//         },
//         {
//           question:
//             "Our organization has a process in place to identify and address changes that could affect our energy management system and energy performance.",
//           recommendation:
//             "Implement a formal change management process to proactively identify and address factors that could impact your EMIS and energy performance, ensuring system resilience and effectiveness.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Energy Review, Analysis, and Targets",
//       description:
//         "Assessment of your organization’s energy consumption and the establishment of relevant KPIs and targets to improve energy performance.",
//       questions: [
//         {
//           question:
//             "Our organization has established clear criteria for determining Significant Energy Uses (SEUs) that include both substantial energy consumption and considerable potential for energy performance improvement.",
//           recommendation:
//             "Develop and document specific criteria for identifying SEUs, considering both high energy consumption and significant potential for improvement, to focus energy management efforts effectively.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have engaged company-wide to establish informal targets for reducing energy consumption in our business.",
//           recommendation:
//             "Establish company-wide informal targets for reducing energy consumption.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have established a baseline for energy use and cost within our organization (e.g. comparison against prior year) and communicated this to employees.",
//           recommendation:
//             "Establish the baseline of your energy use and cost and communicate this to employees.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have conducted a review of our energy-using equipment and energy bills to identify savings opportunities.",
//           recommendation:
//             "Conduct a review of your energy-using equipment and energy bills to identify savings opportunities.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have set formal targets and KPIs for improving energy performance.",
//           recommendation:
//             "Establish formal targets and KPIs for improving energy performance.",
//           priority: 2,
//         },
//         {
//           question:
//             "We normalize energy consumption based on significant variables (e.g. production, occupancy, ft², weather) and track against our baseline.",
//           recommendation:
//             "Ensure that energy consumption is normalized based on significant variables (e.g. production, occupancy, ft², weather) and tracked against your baseline.",
//           priority: 2,
//         },
//         {
//           question:
//             "We have conducted an assessment of our energy performance, costs, and opportunities to improve energy performance within our facilities (e.g. an energy audit).",
//           recommendation:
//             "Conduct an assessment of your energy performance costs and opportunities to improve energy performance within our facilities.",
//           priority: 2,
//         },
//         {
//           question:
//             "We conduct periodic reviews of large energy systems and repair variances/faults (e.g. boilers, compressors, HVAC, and compressed air).",
//           recommendation:
//             "Conduct periodic reviews of your large energy systems and repair variances/faults.",
//           priority: 2,
//         },
//         {
//           question:
//             "We regularly evaluate our energy performance by comparing Energy performance index values to their corresponding energy baselines (EnBs).",
//           recommendation:
//             "Implement a systematic process to regularly compare EnPI values against established energy baselines, enabling accurate assessment of energy performance improvements and identifying areas for further optimization.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have energy performance targets and KPIs for large energy systems and/or equipment in our business that are updated regularly (at least annually).",
//           recommendation:
//             "Establish energy performance targets and KPIs for large energy systems and/or equipment and ensure they are updated regularly (at least annually).",
//           priority: 3,
//         },
//         {
//           question:
//             "We occasionally update our baseline to account for major events (e.g. new equipment, changes in processes and facilities).",
//           recommendation:
//             "Implement protocol to ensure baselines are updated occasionally to account for major events",
//           priority: 3,
//         },
//         {
//           question:
//             "We have conducted comprehensive technical assessments of opportunities to improve energy performance within each of our key facilities.",
//           recommendation:
//             "Conduct comprehensive technical assessments of opportunities to improve energy performance within each of your key facilities.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have conducted a review of organizational activities that affect our energy performance and identified opportunities to improve (e.g. operating and maintenance practices, processes, seasonal variations).",
//           recommendation:
//             "Conduct a review of organizational activities that affect your energy performance and identify opportunities to improve.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have formal objectives and targets at each level within our organization, that have clear timeframes for achievement and are consistent with our energy policy.",
//           recommendation:
//             "Establish formal objectives and targets at each level within your organization, ensuring they have clear timeframes for achievement and are consistent with your energy policy.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our baselines and KPIs are reviewed, adjusted, and recorded, based on defined criteria.",
//           recommendation:
//             "Establish a protocol to review, adjust, and record baselines and KPIs based on defined criteria.",
//           priority: 4,
//         },
//         {
//           question:
//             " Ensure that organization has the authority to control all energy uses within the scope and boundaries, and that no energy-using equipment or systems are excluded unless they are separately metered or a dependable calculation can be made.",
//           recommendation:
//             "Clearly define EMIS scope and boundaries, ensuring authority over all included energy uses, and only exclude equipment or systems that are separately metered or can be reliably calculated, to maintain comprehensive energy management control.",
//           priority: 4,
//         },
//         {
//           question:
//             "We conduct formal energy assessments at defined intervals based on measured data and for each large energy system.",
//           recommendation:
//             "Establish a protocol to conduct formal energy assessments at defined intervals based on measured data and for each large energy system.",
//           priority: 4,
//         },
//         {
//           question:
//             "We record and maintain energy review documentation which includes key energy data, large energy systems, energy performance results, and improvement opportunities.",
//           recommendation:
//             "Establish a protocol to begin recording and maintaining energy review documentation which includes key energy data, large energy systems, energy performance results, and improvement opportunities.",
//           priority: 4,
//         },
//         {
//           question:
//             "We update our energy review at defined intervals and following major facility, equipment, system or process changes.",
//           recommendation:
//             "Establish a protocol to update your energy review at defined intervals and following major facility, equipment, system or process changes.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our energy KPIs are embedded within our business performance metrics or organization scorecard (if your organization does not have a scorecard, select “Needs improvement”).",
//           recommendation:
//             "Ensure KPIs are embedded within your business performance metrics or organization scorecard.",
//           priority: 5,
//         },
//         {
//           question:
//             "Energy use variations from target for each of our large energy systems are tracked and reviewed at least monthly.",
//           recommendation:
//             "Establish a protocol to track and review energy use variations from target for each of your large energy systems at least monthly.",
//           priority: 5,
//         },
//         {
//           question:
//             "We have documented an energy balance or energy value stream map for at least 80% of our total energy consumption.",
//           recommendation:
//             "Document an energy balance or energy value stream map for at least 80% of your total energy consumption.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Monitoring",
//       description:
//         "Assessment of your organization’s process for monitoring energy consumption and continually analyzing data.",
//       questions: [
//         {
//           question:
//             "We occasionally record and review energy consumption and costs at our facility level.",
//           recommendation:
//             "Conduct regular monitoring of energy consumption and costs at your facility level.",
//           priority: 1,
//         },
//         {
//           question:
//             "We regularly record and review key factors that impact our energy performance (e.g. consumption, large energy systems, weather, production lines, hours of operation, occupancy).",
//           recommendation:
//             "Conduct regular recording and review of key factors that impact your energy performance.",
//           priority: 2,
//         },
//         {
//           question:
//             "We have resources in place to collect the data (meters/control system), and a staff assigned and trained to acquire and analyze relevant energy data.",
//           recommendation:
//             "Assign and train staff to acquire and analyze relevant energy data.",
//           priority: 2,
//         },
//         {
//           question:
//             "At consistent and planned intervals, our staff record, review, and analyze key factors impacting energy performance of large energy systems (or facilities).",
//           recommendation:
//             "Establish protocol for staff to regularly ,record, review and analyze key factors impacting energy performance of large energy systems (or facilities).",
//           priority: 3,
//         },
//         {
//           question:
//             "We have identified our energy monitoring/submetering needs and plans to improve (as appropriate).",
//           recommendation:
//             "Identify your energy monitoring/submetering needs and create plans to improve (as appropriate).",
//           priority: 3,
//         },
//         {
//           question:
//             "We have documented the frequency and scope of energy measurement for our organization.",
//           recommendation:
//             "Document the frequency and scope of energy measurement for your organization.",
//           priority: 4,
//         },
//         {
//           question:
//             "We ensure all energy-related data collection measurement means are accurate and/or calibrated and records of the calibration are stored.",
//           recommendation:
//             "Ensure all data collection measurement means are accurate and/or calibrated and records of the calibration are stored.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our staff investigate and respond to significant deviations in our energy performance.",
//           recommendation:
//             "Assign staff to investigate and respond to significant deviations in your energy performance.",
//           priority: 4,
//         },
//         {
//           question:
//             "We have submetering in place for large energy systems (processes and equipment).",
//           recommendation:
//             "Put in place submetering for large energy systems (processes and equipment).",
//           priority: 5,
//         },
//         {
//           question:
//             "We have an energy information system accessible to relevant staff, that captures energy use, energy cost, and energy drivers (e.g. production, occupancy).",
//           recommendation:
//             "Implement an energy information system that captures energy use, energy cost, and energy drivers, and ensure it is accessible to relevant staff.",
//           priority: 5,
//         },
//         {
//           question:
//             "All relevant staff have been trained on common energy analysis tools and procedures.",
//           recommendation:
//             "Implement training on common energy analysis tools and procedures for all relevant staff.",
//           priority: 5,
//         },
//         {
//           question:
//             "We maintain comprehensive records of all results from our energy performance monitoring and measurement activities.",
//           recommendation:
//             "Establish a systematic approach to maintain comprehensive records of all energy performance monitoring and measurement results, ensuring data accuracy and facilitating ongoing analysis for continuous improvement.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Action plans, Reporting, Review and Reassessment",
//       description:
//         "Assessment of your organization’s specific plans related to energy management and how your organization manages flow of information and responds to assessment results.",
//       questions: [
//         {
//           question:
//             "We have plans to improve energy efficiency (e.g. on an ad hoc or project by project basis).",
//           recommendation:
//             "Identify opportunities to improve energy performance within your business, prioritize opportunities, and prepare an improvement plan.",
//           priority: 1,
//         },
//         {
//           question:
//             "Our energy consumption is reported to and reviewed by management at least once a year (e.g. during annual budget cycle).",
//           recommendation:
//             "Prepare a regular report of energy consumption for review by your management team at least once a year (e.g. during annual budget cycle).",
//           priority: 1,
//         },
//         {
//           question:
//             "We have action plans for the current year for reducing energy use and organizational activities, including timeframes and responsibilities for each project.",
//           recommendation:
//             "Implement action plans for the current year for reducing energy use and organizational activities, including timeframes and responsibilities for each project.",
//           priority: 2,
//         },
//         {
//           question:
//             "Our action plans include both capital and low-cost (e.g. operations and maintenance, occupant engagement) improvements and savings estimates, and are updated regularly.",
//           recommendation:
//             "Ensure that your action plans include both capital and low-cost improvements and savings estimates, and are updated regularly.",
//           priority: 2,
//         },
//         {
//           question:
//             "We regularly review our energy performance against targets and take actions when necessary.",
//           recommendation:
//             "Regularly review your energy performance against targets and take actions when necessary.",
//           priority: 2,
//         },
//         {
//           question:
//             "We regularly report our energy performance and achievements to management during a fiscal year.",
//           recommendation:
//             "Prepare a regular report of energy performance and achievements for review by your management team at least once a year (e.g. during annual budget cycle).",
//           priority: 2,
//         },
//         {
//           question: "Our management reviews and approves our action plans.",
//           recommendation:
//             "Prepare a regular report of the progress of your action plans for review by your management team at least once a year (e.g. during annual budget cycle).",
//           priority: 3,
//         },
//         {
//           question:
//             "We regularly (at least annually) review activities in our action plans and verify project results against the plans.",
//           recommendation:
//             "Conduct regular (at least annually) reviews of the action plan activities and verify project results against the plans.",
//           priority: 3,
//         },
//         {
//           question:
//             "We regularly (e.g. annually) conduct a formal review of our energy performance results and our plans for the coming year(s).",
//           recommendation:
//             "Conduct regular (at least annually) reviews of your energy performance results and plans for the coming year(s).",
//           priority: 3,
//         },
//         {
//           question:
//             "Our action plans are designed to achieve our written objectives and targets, and are updated at defined intervals.",
//           recommendation:
//             "Ensure your action plans are designed to achieve your written objectives and targets, and are updated at defined intervals.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our action plans include clear designation of responsibility, means and timeframe by which targets are to be achieved, and a prescribed method for verifying results.",
//           recommendation:
//             "Ensure your action plans are designed with clear designations of responsibility, means, and timeframes by which targets are to be achieved, along with a prescribed method for verifying results.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our energy champion reports on our energy and Strategic Energy Management (SEM) program performance to top management at intervals defined by top management.",
//           recommendation:
//             "Ensure that your energy champion reports on your energy and SEM program performance to top management at intervals defined by top management.",
//           priority: 4,
//         },
//         {
//           question:
//             "At planned intervals our top management reviews our SEM program to ensure its suitability, adequacy, and effectiveness.",
//           recommendation:
//             "Engage top management to review your SEM program to ensure its suitability, adequacy, and effectiveness at planned intervals.",
//           priority: 4,
//         },
//         {
//           question:
//             "Outputs from reviews of our SEM program by top management include specific improvement actions (e.g. changes to energy policy, KPIs or targets).",
//           recommendation:
//             "Engage top management to ensure that reviews of your SEM program include specific improvement actions (e.g. changes to energy policy, KPIs, or targets).",
//           priority: 4,
//         },
//         {
//           question:
//             "Our energy action plans are aligned with our energy policy, endorsed by top management, and regularly reviewed for effectiveness (at least quarterly).",
//           recommendation:
//             "Ensure that your energy action plans are aligned with your energy policy, endorsed by top management, and regularly reviewed for effectiveness (at least quarterly).",
//           priority: 5,
//         },
//         {
//           question:
//             "Our entire organization is assessed on performance against our energy action plans.",
//           recommendation:
//             "Make performance against your energy action plans a part of assessments for the entire organization.",
//           priority: 5,
//         },
//         {
//           question:
//             "We have an executive officer that reviews our energy teams activities on a regular basis.",
//           recommendation:
//             "Engage top management to assign an executive officer to review your energy team’s activities on a regular basis.",
//           priority: 5,
//         },
//         {
//           question:
//             "Energy reporting and review is a regular responsibility of all appropriate units of the organization.",
//           recommendation:
//             "Make energy reporting and review a regular responsibility of all appropriate units of the organization.",
//           priority: 5,
//         },
//         {
//           question:
//             "We conduct regular management reviews of energy projects, large energy systems, and SEM program processes.",
//           recommendation:
//             "Conduct regular management reviews of energy projects, large energy systems, and SEM program processes.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Operations and Maintenance",
//       description:
//         "The degree to which your organization has integrated energy management into regular business operations.",
//       questions: [
//         {
//           question:
//             "Operations and maintenance staff implement low/no-cost energy savings measures when identified (e.g. checking air damper operations, lighting controls, compressed air leaks, steam trap leaks).",
//           recommendation:
//             "Engage with operations and maintenance staff and create a protocol to identify and implement low/no-cost energy savings measures (e.g. checking air damper operations, lighting controls, compressed air leaks, steam trap leaks).",
//           priority: 1,
//         },
//         {
//           question:
//             "We have created a comprehensive SEU operating criteria worksheet for each of our significant energy uses.",
//           recommendation:
//             "Develop detailed operating criteria worksheets for each identified Significant Energy Use (SEU), outlining optimal parameters, control measures, and monitoring protocols to maximize energy efficiency and performance.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have made changes to our established standard operating procedures to reduce energy waste and to ensure persistence of energy savings (If your organization has no standard operating procedures, select “Needs improvement”).",
//           recommendation:
//             "Make changes to your established standard operating procedures to reduce energy waste and to ensure persistence of energy savings.",
//           priority: 2,
//         },
//         {
//           question:
//             "Changes in operating procedures to improve energy efficiency have been communicated to facilities, operations, and maintenance staff.",
//           recommendation:
//             "Communicate changes in operating procedures to improve energy efficiency to all facilities, operations, and maintenance staff.",
//           priority: 2,
//         },
//         {
//           question:
//             "Energy-related operations and maintenance activities are the assigned responsibility of specific staff (e.g. facilities or maintenance team).",
//           recommendation:
//             "Assign energy-related operations and maintenance activities as responsibilities of specific staff members.",
//           priority: 3,
//         },
//         {
//           question:
//             "Critical factors affecting energy performance are documented and regularly communicated to responsible personnel.",
//           recommendation:
//             "Implement a system to document and routinely communicate critical energy performance factors to relevant staff, ensuring awareness and enabling timely responses to optimize energy efficiency.",
//           priority: 3,
//         },
//         {
//           question:
//             "Our energy champion has established formal criteria and procedures within our Strategic Energy Management (SEM) program to ensure effective operation and control of energy systems.",
//           recommendation:
//             "Have your energy champion establish formal criteria and procedures within your SEM program to ensure effective operation and control of energy systems.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our operations and maintenance procedures for energy systems include defined criteria to limit energy performance deviation from target.",
//           recommendation:
//             "Ensure your operations and maintenance procedures for energy systems include defined criteria to limit energy performance deviation from target.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our operations and maintenance staff have identified preventive maintenance activities to improve efficiency in large energy systems, which are managed in our maintenance system and completed as scheduled.",
//           recommendation:
//             "Encourage operational and maintenance staff to look for additional energy saving opportunities from the energy management system perspective.",
//           priority: 5,
//         },
//         {
//           question:
//             "Our control systems are regularly monitored to ensure we continue to operate large energy systems at the designed energy performance.",
//           recommendation:
//             "Implement regular monitoring of your control systems to ensure you continue to operate large energy systems at the designed energy performance.",
//           priority: 5,
//         },
//         {
//           question:
//             "All equipment that collectively consumes more than 70% of total facility energy consumption has been designated as large energy systems, and has operating and maintenance procedures that maximize energy performance.",
//           recommendation:
//             "Identify all equipment that collectively consumes more than 70% of total facility energy consumption and put in place operating and maintenance procedures that maximize energy performance.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Employee Engagement",
//       description:
//         "The level of employees’ awareness of and involvement in your organization’s energy management policy, consumption and savings.",
//       questions: [
//         {
//           question:
//             "We have more than one employee taking action to improve our energy performance (e.g. motivated employees are taking ad-hoc actions to improve energy management).",
//           recommendation:
//             "Assign at least one staff member responsibility for energy performance within your organization, as part of their role.",
//           priority: 1,
//         },
//         {
//           question:
//             "We conduct employee awareness, which includes communication of our performance against targets and actions to reduce energy use.",
//           recommendation:
//             "Regularly communicate your performance against targets and actions to reduce energy use with employees.",
//           priority: 2,
//         },
//         {
//           question: "We conduct awareness training and retain record",
//           recommendation:
//             "Implement regular awareness training sessions for employees on energy management practices and maintain comprehensive records of all training activities to ensure accountability and continuous improvement.",
//           priority: 2,
//         },
//         {
//           question:
//             "We actively solicit employee ideas about how to improve our energy program and energy performance (e.g. through suggestions box, company newsletters, competitions etc.)",
//           recommendation:
//             "Actively solicit employee ideas about how to improve your energy program and energy performance (e.g. through suggestions box, company newsletters, competitions etc.).",
//           priority: 2,
//         },
//         {
//           question:
//             "Most of our employees and facility occupants are familiar with our energy policy and energy performance.",
//           recommendation:
//             "Implement regular communications to ensure that all of your employees and facility occupants are familiar with your energy policy and energy performance.",
//           priority: 3,
//         },
//         {
//           question:
//             "Most of our employees understand how their actions can impact achievement of our energy targets.",
//           recommendation:
//             "Make understanding how their actions can impact achievement of your energy targets a regular part of communication with employees.",
//           priority: 3,
//         },
//         {
//           question:
//             "Our management regularly communicates the importance of energy performance including energy policy and objectives/targets to all operations staff/employees.",
//           recommendation:
//             "Engage with management to ensure regular communication of the importance of energy performance, including energy policy and objectives/targets, to all operations staff/employees.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our staff are aware of their roles, responsibilities and authorities within our Strategic Energy Management (SEM) program and are aware of how their behaviors contribute to our energy objectives/targets.",
//           recommendation:
//             "Make awareness of their roles, responsibilities, and authorities within your SEM program, as well as how their behaviors contribute to your energy objectives/targets, a part of regular employee reviews.",
//           priority: 4,
//         },
//         {
//           question:
//             "Employee suggestions about improvement in energy performance are recognized and rewarded.",
//           recommendation:
//             "Ensure employee suggestions about improvement in energy performance are recognized and rewarded.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our organization's targets are broken down to specific employee or facility targets and relevant employees have energy targets in their personal objectives.",
//           recommendation:
//             "Create organizational targets that are broken down to specific employee or facility targets and ensure relevant employees have energy targets in their personal objectives.",
//           priority: 5,
//         },
//         {
//           question:
//             "Energy management is part of each appropriate employees’ annual review.",
//           recommendation:
//             "Make energy management a part of each appropriate employees’ annual review.",
//           priority: 5,
//         },
//         {
//           question:
//             "We routinely communicate with our community and external stakeholders regarding our energy performance as compared to our goals, in the interest of accountability.",
//           recommendation:
//             "Ensure regular communication with your community and external stakeholders regarding your energy performance as compared to your goals, in the interest of accountability.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Procurement and Design",
//       description:
//         "The degree to which your organization includes energy in the design of purchasing policies for equipment and supplies.",
//       questions: [
//         {
//           question:
//             "Energy has been considered in equipment procurement and facility design in the last year.",
//           recommendation:
//             "Ensure that equipment procurement and facility design protocols have energy use as part of their considerations.",
//           priority: 1,
//         },
//         {
//           question:
//             "Energy performance is regularly used in decision-making for capital procurement or facility design decisions.",
//           recommendation:
//             "Ensure that energy performance is used regularly in decision-making for capital procurement or facility design decisions.",
//           priority: 2,
//         },
//         {
//           question:
//             "Energy performance is included in our capital approval process (e.g. on expenditure application form or formal capital approval process).",
//           recommendation:
//             "Make energy performance a part of your capital approval process.",
//           priority: 3,
//         },
//         {
//           question:
//             "We have written procedures for procurement of services, products, and equipment (e.g., heating and cooling equipment, computers, printers) that target energy use reductions, and our suppliers are informed that energy performance is part of our purchasing evaluation.",
//           recommendation:
//             "Create written procedures for procurement of services, products, and equipment that target energy use reductions, and inform your suppliers that energy performance is part of your purchasing evaluation.",
//           priority: 4,
//         },
//         {
//           question:
//             "When purchasing energy consuming equipment, we utilize documented criteria to assess the energy consumption over the equipment's expected operating lifetime (e.g. lifecycle analysis for boilers, chillers etc.).",
//           recommendation:
//             "Create and document criteria to assess energy consumption over equipment’s expected operating lifetime, and ensure this criteria is utilized during purchasing decisions.",
//           priority: 4,
//         },
//         {
//           question:
//             "We regularly review and update our procurement criteria and specifications to ensure they align with our current energy performance objectives and targets.",
//           recommendation:
//             "Implement a systematic process to regularly review and update procurement criteria, ensuring alignment with evolving energy performance objectives and leveraging purchasing power to support energy efficiency goals.",
//           priority: 4,
//         },
//         {
//           question:
//             "Options to improve the energy performance of large energy systems are formally considered in the design of new, modified and renovated facilities, equipment, systems, and processes.",
//           recommendation:
//             "Ensure that options to improve the energy performance of large energy systems are formally considered in the design of new, modified, and renovated facilities, equipment, systems, and processes.",
//           priority: 4,
//         },
//         {
//           question:
//             "Onsite energy generation is considered alongside purchased utility energy, when appropriate.",
//           recommendation:
//             "Consider implementing onsite energy generation alongside purchased utility energy, if appropriate.",
//           priority: 5,
//         },
//         {
//           question:
//             "For major upgrades, we identify energy efficient opportunities, analyze savings, and include these when cost effective.",
//           recommendation:
//             "For major upgrades, include identifying energy efficient opportunities and analyzing savings when cost effective.",
//           priority: 5,
//         },
//         {
//           question:
//             "We have formal procedures that take energy efficiency into account in repair/replacement decisions (e.g. life cycle guidelines for repair/replacement of motors).",
//           recommendation:
//             "Create and implement formal procedures that take energy efficiency into account in repair/replacement decisions.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Documentation and Records",
//       description:
//         "Assessment of how your organization documents energy-related operational processes and manages these records over time.",
//       questions: [
//         {
//           question:
//             "We document our energy management activities in at least an ad-hoc manner.",
//           recommendation:
//             "Formally document your energy management activities, including your energy policy, baseline, targets, plans, and results.",
//           priority: 1,
//         },
//         {
//           question:
//             "We have documented our energy policy, baseline, targets, plans, and results.",
//           recommendation:
//             "Formally document your energy management activities, including your energy policy, baseline, targets, plans, and results.",
//           priority: 2,
//         },
//         {
//           question:
//             "Our energy-related documents are regularly (at least annually) reviewed and updated to help guide actions.",
//           recommendation:
//             "Ensure that energy-related documents are reviewed and updated at least annually to help guide actions.",
//           priority: 3,
//         },
//         {
//           question:
//             "Our energy program is comprehensively and consistently documented (e.g. records, planning, policy, objectives, targets, plans, decisions, purchasing specifications, results, etc.).",
//           recommendation:
//             "Make your energy program documentation more comprehensive and robust, including details like records, planning, policy, objectives, targets, plans, decisions, purchasing specifications, results, etc.",
//           priority: 4,
//         },
//         {
//           question:
//             "Documents required by our SEM program are controlled through a formal system that includes current revision status, changes, approval, and periodic review.",
//           recommendation:
//             "Implement a formal control system for your SEM program documents that includes current revision status, changes, approval, and periodic review.",
//           priority: 4,
//         },
//         {
//           question:
//             "Our organization has defined and implemented controls for the identification, retrieval, retention, legibility and traceability of energy-related records (e.g. energy reviews, methodologies for updating KPIs, SEM program audit results, calibration etc.).",
//           recommendation:
//             "Define and implement controls for the identification, retrieval, retention, legibility, and traceability of energy-related records (e.g. energy reviews, methodologies for updating KPIs, SEM program audit results, calibration etc.).",
//           priority: 5,
//         },
//         {
//           question:
//             "Our organization has a comprehensive list of all EMIS documents and records, including assigned owners and approvers for each",
//           recommendation:
//             "Develop and maintain a centralized document control system listing all EMIS documents and records, clearly assigning ownership and approval responsibilities to ensure proper management and version control.",
//           priority: 5,
//         },
//       ],
//     },
//     {
//       category: "Energy Management System Audits",
//       description:
//         "Assessment of your organization’s process for periodically evaluating your energy management practices as a whole.",
//       questions: [
//         {
//           question:
//             "We have previously assessed our current practices with an Energy Management Assessment or performance scorecard (prior to this assessment).",
//           recommendation:
//             "Regularly (e.g. quarterly) perform and review energy management assessments or scorecards and take actions identified during.",
//           priority: 1,
//         },
//         {
//           question:
//             "We regularly (at least every 6 months) review attainment of our energy management plans and set an appropriate course correction for continuous improvement as needed.",
//           recommendation:
//             "Implement regular (at least every 6 months) review of the attainment of your energy management plans and set an appropriate course correction for continuous improvement as needed.",
//           priority: 2,
//         },
//         {
//           question:
//             "We have established a process to monitor and measure EMIS performance, including trends in nonconformities and corrective actions.",
//           recommendation:
//             "Implement a systematic process to monitor and measure EMIS performance, tracking trends in nonconformities and corrective actions, to ensure continuous improvement and effectiveness of your energy management system.",
//           priority: 2,
//         },
//         {
//           question:
//             "We utilize root cause analysis (problem-solving method to identify the cause) to understand reasons for Strategic Energy Management (SEM) program non-performance, and then take appropriate action.",
//           recommendation:
//             "Implement problem-solving procedures based in root cause analysis to understand reasons for SEM program non-performance, and then take appropriate action.",
//           priority: 3,
//         },
//         {
//           question:
//             "We regularly evaluate our compliance with applicable energy-related legal and other requirements.",
//           recommendation:
//             "Implement a systematic process to regularly review and document compliance with all applicable energy-related legal and other requirements, ensuring ongoing adherence and mitigating compliance risks.",
//           priority: 3,
//         },
//         {
//           question:
//             "At planned intervals we conduct internal SEM program audits to ensure ISO 50001-level conformance and energy performance improvement.",
//           recommendation:
//             "Conduct internal SEM program audits to ensure ISO 50001-level conformance and energy performance improvement at planned, regular intervals.",
//           priority: 4,
//         },
//         {
//           question:
//             "We have identified and trained specific personnel to serve as Energy Management Information System (EMIS) internal auditors, including training on ISO 50001 requirements and internal auditing procedures.",
//           recommendation:
//             "Designate and train dedicated personnel as EMIS internal auditors, equipping them with knowledge of ISO 50001 requirements and internal auditing procedures to ensure effective system evaluation and improvement.",
//           priority: 4,
//         },
//         {
//           question:
//             "Results of SEM program audits are maintained and reported to executives, including nonconformities and corrective actions to our SEM program.",
//           recommendation:
//             "Ensure results of SEM program audits are maintained and reported to executives, including nonconformities and corrective actions to your SEM program.",
//           priority: 4,
//         },
//         {
//           question:
//             "We use preventive actions as input to energy projects by using real-time data trends, energy review updates, and supplier data trends.",
//           recommendation:
//             "Use preventive actions as input to energy projects by using real-time data trends, energy review updates, and supplier data trends.",
//           priority: 5,
//         },
//         {
//           question:
//             "Results of SEM program audits are consistently used to improve energy management.",
//           recommendation:
//             "Conduct regular SEM program audits and consistently use the results to improve energy management.",
//           priority: 5,
//         },
//         {
//           question:
//             "We analyze and evaluate the results of both internal and external EMIS audits to improve our energy management system.",
//           recommendation:
//             "Implement a systematic process to analyze and evaluate findings from internal and external EMIS audits, using insights to drive continuous improvement of your energy management system.",
//           priority: 5,
//         },
//         {
//           question:
//             "We evaluate the effectiveness of our EMIS in relation to our organization's strategic goals and priorities.",
//           recommendation:
//             "Regularly assess how your EMIS supports and aligns with organizational strategic goals, ensuring it delivers value and drives energy performance improvements that contribute to broader business objectives.",
//           priority: 5,
//         },
//       ],
//     },
//   ];

//   try {
//     const response = await fetch("http://localhost:3000/reset-questions", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(data),
//     });

//     if (response.ok) {
//       const result = await response.json();
//       console.log(result.message); // Output: Questions reset successfully!
//     } else {
//       console.error("Failed to reset questions");
//     }
//   } catch (error) {
//     console.error("Error:", error);
//   }
// };

// resetQuestions();

