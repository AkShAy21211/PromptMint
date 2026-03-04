import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "PromptMint — AI Prompt Generator for Developers";
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    background: "linear-gradient(to bottom right, #1e1b4b, #4338ca, #09090b)",
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "sans-serif",
                    color: "white",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px 40px",
                        background: "rgba(255, 255, 255, 0.05)",
                        borderRadius: "30px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                    }}
                >
                    <h1
                        style={{
                            fontSize: "100px",
                            fontWeight: "bold",
                            background: "linear-gradient(to right, #a78bfa, #c084fc)",
                            backgroundClip: "text",
                            color: "transparent",
                            margin: 0,
                        }}
                    >
                        PromptMint
                    </h1>
                </div>
                <p
                    style={{
                        fontSize: "32px",
                        color: "#a1a1aa",
                        marginTop: "40px",
                        textAlign: "center",
                        maxWidth: "800px",
                        lineHeight: 1.4,
                    }}
                >
                    Turn your messy dev idea into a structured AI prompt
                </p>
            </div>
        ),
        {
            ...size,
        }
    );
}
