// Vercel Serverless Function: /api/analyze
// Calls OpenAI gpt-4o-mini Vision to analyze food image
// API key is stored as environment variable OPENAI_API_KEY (never exposed to frontend)

export const config = {
  maxDuration: 30,
};

const SYSTEM_PROMPT_ZH = `你是一位专业的营养师和食物识别专家。分析用户上传的食物照片，返回 JSON 格式的分析结果。

要求：
1. 准确识别照片中所有食物
2. 估算总热量、碳水、蛋白质、脂肪
3. 给出健康评分 (0-100)
4. 提供 3 条具体可行的健康建议（每条 1-2 句话，针对这餐的具体食物）

返回 **纯 JSON**（不要 markdown，不要 \`\`\`），结构如下：

{
  "meal_name": "<餐食名称，如「番茄牛肉面」>",
  "portion_estimate": "<份量描述，如「约一人份 · 含汤面与配菜」>",
  "total_calories": <整数>,
  "calorie_context": "<相对参考，如「约等于 1 小时慢跑消耗的热量」>",
  "macros": {
    "carbs_g": <整数>,
    "protein_g": <整数>,
    "fat_g": <整数>
  },
  "health_score": <0-100 整数>,
  "health_title": "<3-6字评价，如「营养均衡」「碳水偏高」>",
  "health_description": "<1 句话描述，约 30 字>",
  "items": [
    { "name": "<食物名>", "emoji": "<对应表情>", "portion": "<份量>", "calories": <整数> }
  ],
  "tips": ["<建议 1>", "<建议 2>", "<建议 3>"]
}

如果照片中没有食物或无法识别，请返回：
{ "error": "no_food_detected" }`;

const SYSTEM_PROMPT_EN = `You are a professional nutritionist and food recognition expert. Analyze the user's food photo and return JSON.

Requirements:
1. Identify all foods in the photo
2. Estimate total calories, carbs, protein, fat
3. Give a health score (0-100)
4. Provide 3 actionable health tips (1-2 sentences each, specific to the foods shown)

Return **pure JSON** (no markdown, no \`\`\`), with this exact structure:

{
  "meal_name": "<meal name, e.g. 'Beef Noodle Soup'>",
  "portion_estimate": "<portion description, e.g. 'Approx. 1 serving · noodles with sides'>",
  "total_calories": <integer>,
  "calorie_context": "<comparison, e.g. 'About 1 hour of jogging'>",
  "macros": {
    "carbs_g": <integer>,
    "protein_g": <integer>,
    "fat_g": <integer>
  },
  "health_score": <0-100 integer>,
  "health_title": "<3-5 word verdict, e.g. 'Well-balanced' or 'High carb'>",
  "health_description": "<1 sentence, ~20 words>",
  "items": [
    { "name": "<food>", "emoji": "<emoji>", "portion": "<portion>", "calories": <integer> }
  ],
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

If no food is detected, return: { "error": "no_food_detected" }`;

export default async function handler(req, res) {
  // CORS (only if you want to call from other domains; safe to leave for same-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const { image, mediaType, lang } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'Missing image' });
    }

    const systemPrompt = lang === 'en' ? SYSTEM_PROMPT_EN : SYSTEM_PROMPT_ZH;
    const userText = lang === 'en' ? 'Analyze this food.' : '分析这张食物照片。';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1200,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mediaType || 'image/jpeg'};base64,${image}`,
                  detail: 'low', // 'low' is cheaper and works fine for food
                },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI error:', errText);
      return res.status(response.status).json({ error: 'AI service error', detail: errText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(500).json({ error: 'Empty response from AI' });
    }

    let parsed;
    try {
      parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
    } catch (e) {
      console.error('Parse error:', content);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    if (parsed.error === 'no_food_detected') {
      return res.status(400).json({ error: 'no_food_detected' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
