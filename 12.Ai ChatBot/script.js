
let prompt = document.querySelector("#prompt");
let submitbtn = document.querySelector("#submit");
let chatContainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let image = document.querySelector("#image img");
let imageinput = document.querySelector("#image input");

// Replace with your actual Groq API key
const API_KEY = "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"; 
const API_URL = "https://api.groq.com/openai/v1/chat/completions";

let user = {
    message: "",
    file: {
        mime_type: null,
        data: null
    }
};

async function generateResponse(aiChatBox) {
    const text = aiChatBox.querySelector(".ai-chat-area");

    let messages = [];

    if (user.message.trim() && user.file.data) {
        // Text + Image
        messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: user.message },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${user.file.mime_type};base64,${user.file.data}`
                        }
                    }
                ]
            }
        ];
    } else if (user.file.data) {
        // Image only
        messages = [
            {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${user.file.mime_type};base64,${user.file.data}`
                        }
                    }
                ]
            }
        ];
    } else if (user.message.trim()) {
        // Text only
        messages = [
            {
                role: "user",
                content: user.message
            }
        ];
    } else {
        text.innerHTML = `<span class="error">Please provide a message or an image.</span>`;
        return;
    }

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "meta-llama/llama-4-scout-17b-16e-instruct",
            messages,
            temperature: 0.7,
            max_tokens: 1024
        })
    };

    try {
        const response = await fetch(API_URL, requestOptions);

        if (response.status === 401) {
            throw new Error("Unauthorized: Invalid API key or access token.");
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || "API Error");
        }

        const data = await response.json();
        let reply = data.choices[0]?.message?.content || "No response from AI.";
        reply = reply.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").trim();
        text.innerHTML = reply;
    } catch (error) {
        console.error("Error:", error);
        text.innerHTML = `<span class="error">Error: ${error.message}</span>`;
    } finally {
        chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });
        image.src = "img.svg";
        image.classList.remove("choose");
        user = { message: "", file: { mime_type: null, data: null } };
    }
}



function createChatBox(html, classes) {
    let div = document.createElement("div");
    div.innerHTML = html;
    div.classList.add(classes);
    return div;
}

function handlechatResponse(userMessage) {
    user.message = userMessage.trim();

    if (!user.message && !user.file.data) {
        alert("Please enter a message or upload an image.");
        return;
    }

    let html = `
        <img src="user.png" alt="" id="userImage" width="8%">
        <div class="user-chat-area">
            ${user.message || ""}
            ${user.file.data ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg" />` : ""}
        </div>`;
    prompt.value = "";
    let userChatBox = createChatBox(html, "user-chat-box");
    chatContainer.appendChild(userChatBox);

    chatContainer.scrollTo({ top: chatContainer.scrollHeight, behavior: "smooth" });

    setTimeout(() => {
        let html = `
            <img src="ai.png" alt="" id="aiImage" width="10%">
            <div class="ai-chat-area">
                <img src="loading.webp" alt="" class="load" width="50px">
            </div>`;
        let aiChatBox = createChatBox(html, "ai-chat-box");
        chatContainer.appendChild(aiChatBox);
        generateResponse(aiChatBox);
    }, 600);
}

// Event Listeners
prompt.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        handlechatResponse(prompt.value);
    }
});

submitbtn.addEventListener("click", () => {
    handlechatResponse(prompt.value);
});

imageinput.addEventListener("change", () => {
    const file = imageinput.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
        alert("Please select a valid image file.");
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be under 5MB.");
        return;
    }

    let reader = new FileReader();
    reader.onload = (e) => {
        let base64string = e.target.result.split(",")[1];
        user.file = {
            mime_type: file.type,
            data: base64string
        };
        image.src = `data:${user.file.mime_type};base64,${user.file.data}`;
        image.classList.add("choose");

        // Automatically send the image if no message is present
        if (!prompt.value.trim()) {
            handlechatResponse("");
        }
    };

    reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
    imageinput.click();
});

