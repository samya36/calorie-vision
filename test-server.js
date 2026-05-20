const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

app.use(express.static('.'));

app.post('/api/analyze', async (req, res) => {
    const { image, mediaType, lang } = req.body;

    // Simulate slight delay
    await new Promise(r => setTimeout(r, 1000));

    if (image.length < 100) {
       return res.status(400).json({ error: 'no_food_detected' });
    }

    res.json({
        meal_name: 'Test Meal',
        portion_estimate: '1 serving',
        total_calories: 500,
        calorie_context: 'Equal to 1 hour jogging',
        macros: { carbs_g: 50, protein_g: 30, fat_g: 20 },
        health_score: 80,
        health_title: 'Good Balance',
        health_description: 'Looks healthy',
        items: [{ name: 'Test food', emoji: '🥗', portion: '1 bowl', calories: 500 }],
        tips: ['Eat more greens', 'Drink water', 'Sleep well']
    });
});

app.listen(3000, () => {
    console.log('Test server running on port 3000');
});
