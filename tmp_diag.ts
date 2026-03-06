async function findBestFlash() {
    const apiKey = "AIzaSyCEvWllW-YR3qPRYRwiL14eFg8HKx5VWO4";
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const flashModels = data.models.filter((m: any) =>
            m.name.includes("flash") &&
            m.supportedGenerationMethods.includes("generateContent")
        );

        console.log("Found Flash Models:");
        flashModels.forEach((m: any) => {
            console.log(`- ${m.name}`);
        });
    } catch (error) {
        console.error("Error:", error);
    }
}

findBestFlash();
