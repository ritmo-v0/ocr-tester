import { NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for the request body
const requestSchema = z.object({
	imageUrl: z.string(),
	systemPrompt: z.string(),
	userPrompt: z.string(),
	models: z.array(z.string()).min(1),
	temperature: z.number().optional().default(0),
	batchSize: z.number().optional().default(1),
})



export async function POST(req: Request) {
	try {
		const body = await req.json()
		const { imageUrl, systemPrompt, userPrompt, models, temperature, batchSize } = requestSchema.parse(body)

		const results = []

		// Process with OpenAI models
		const openaiModels = models.filter((model) => model === "gpt-4o" || model === "gpt-4o-mini")

		for (const model of openaiModels) {
			try {
				// Run multiple times based on batchSize
				for (let i = 0; i < batchSize; i++) {
					const openaiResult = await processOpenAI(imageUrl, systemPrompt, userPrompt, model, temperature)
					results.push({
						provider: "openai",
						model,
						...openaiResult,
					})

					// Add a small delay between batch requests to avoid rate limiting
					if (i < batchSize - 1) {
						await new Promise((resolve) => setTimeout(resolve, 500))
					}
				}
			} catch (error) {
				console.error(`Error processing with OpenAI model ${model}:`, error)
				results.push({
					provider: "openai",
					model,
					text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
					raw: { error: true },
				})
			}
		}

		// Process with Gemini models
		const geminiModels = models.filter(
			(model) =>
				model === "gemini-2.0-flash" || model === "gemini-2.0-flash-lite" || model === "gemini-2.0-pro-exp-02-05",
		)

		for (const model of geminiModels) {
			try {
				// Run multiple times based on batchSize
				for (let i = 0; i < batchSize; i++) {
					const geminiResult = await processGemini(imageUrl, systemPrompt, userPrompt, model, temperature)
					results.push({
						provider: "gemini",
						model,
						...geminiResult,
					})

					// Add a small delay between batch requests to avoid rate limiting
					if (i < batchSize - 1) {
						await new Promise((resolve) => setTimeout(resolve, 500))
					}
				}
			} catch (error) {
				console.error(`Error processing with Gemini model ${model}:`, error)
				results.push({
					provider: "gemini",
					model,
					text: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
					raw: { error: true },
				})
			}
		}

		return NextResponse.json({ results })
	} catch (error) {
		console.error("OCR API Error:", error)
		return NextResponse.json(
			{ error: error instanceof Error ? error.message : "An unknown error occurred" },
			{ status: 400 },
		)
	}
}

async function processOpenAI(
	imageUrl: string,
	systemPrompt: string,
	userPrompt: string,
	model: string,
	temperature = 0,
) {
	// Prepare the image URL or base64 content
	let imageContent

	if (imageUrl.startsWith("data:")) {
		// It's already a base64 image
		imageContent = {
			type: "image_url",
			image_url: {
				url: imageUrl,
			},
		}
	} else {
		// It's a URL
		imageContent = {
			type: "image_url",
			image_url: {
				url: imageUrl,
			},
		}
	}

	const response = await fetch("https://api.openai.com/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
		},
		body: JSON.stringify({
			model,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{
					role: "user",
					content: [
						{
							type: "text",
							text: userPrompt,
						},
						imageContent,
					],
				},
			],
			max_tokens: 1000,
			temperature: temperature,
		}),
	})

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`OpenAI API error: ${error}`)
	}

	const data = await response.json()
	return {
		text: data.choices[0]?.message?.content || "",
		raw: data,
	}
}

async function processGemini(
	imageUrl: string,
	systemPrompt: string,
	userPrompt: string,
	model: string,
	temperature = 0,
) {
	let base64Image

	if (imageUrl.startsWith("data:")) {
		// Extract base64 part from data URL
		base64Image = imageUrl.split(",")[1]
	} else {
		// Fetch image and convert to base64 using Node.js compatible method
		try {
			const imageResponse = await fetch(imageUrl)
			const arrayBuffer = await imageResponse.arrayBuffer()
			base64Image = Buffer.from(arrayBuffer).toString("base64")
		} catch (error) {
			throw new Error(`Failed to fetch image from URL: ${error instanceof Error ? error.message : "Unknown error"}`)
		}
	}

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: userPrompt,
							},
							{
								inline_data: {
									mime_type: "image/jpeg",
									data: base64Image,
								},
							},
						],
					},
				],
				system_instruction: {
					parts: [
						{
							text: systemPrompt,
						},
					],
				},
				generation_config: {
					temperature: temperature,
					max_output_tokens: 1000,
				},
			}),
		},
	)

	if (!response.ok) {
		const error = await response.text()
		throw new Error(`Gemini API error: ${error}`)
	}

	const data = await response.json()
	return {
		text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
		raw: data,
	}
}
