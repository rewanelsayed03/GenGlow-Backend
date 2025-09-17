const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    skinType: String,
    skinConcerns: [String],
    hairType: String,
    hairConcerns: [String],
    sleepHours: String,
    pollutionExposure: String,
    diet: String,
    familyHistory: [String],
    allergies: [String],
    goals: [String],
    recommendedProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }]
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
