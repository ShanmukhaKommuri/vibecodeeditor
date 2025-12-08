
import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
    role: "user" | "assistant";
    content: string;
}

interface ChatRequest {
    history: ChatMessage[];
    message: string;
}

const generateAiResponse = async (messages: ChatMessage[]): Promise<string> => {
    const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

    const fullMessages = [
        { role: "system", content: systemPrompt },
        ...messages
    ]

    const prompt = fullMessages.map(msg => `${msg.role} : ${msg.content}`).join("\n\n")

    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama3.2:1b",
                prompt,
                stream: false,
                options: {
                    temperature: 0.7, //controls randomness (0-1)
                    max_tokens: 1000, // maximum response length
                    top_p: 0.9 // controls diversity
                }
            })
        })

        const data = await response.json();
        if (!data.response) {
            throw new Error("No response from ai model");
        }

        return data.response.trim();

    } catch (error) {
        console.error("Ai generation error : ", error);
        throw new Error("Failed to generate ai response");
    }
}

export async function POST(req: NextRequest) {
    try {
        const body: ChatRequest = await req.json();
        const { message, history = [] } = body;

        if (!message || typeof message !== "string") {
            return NextResponse.json({ error: "Message is required and must be a string" }, { status: 400 })
        }

        const validHistory = Array.isArray(history)
            ? history.filter(
                (msgObj) => msgObj && typeof msgObj === 'object' && typeof msgObj.content === "string" && typeof msgObj.role === "string" && ["user", "assistant"].includes(msgObj.role))
            : [];


        const recentHistory = validHistory.slice(-10);

        const messages: ChatMessage[] = [
            ...recentHistory,
            { role: "user", content: message }
        ]

        //  generate ai response


        const aiResponse = await generateAiResponse(messages);

        return NextResponse.json({
            response: aiResponse,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : "unknown error";
        return NextResponse.json({
            error: "Failed to generate ai response",
            details: errorMsg,
            timestamp: new Date().toISOString(),
        }, { status: 500 })
    }

}