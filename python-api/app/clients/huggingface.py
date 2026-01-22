from huggingface_hub import InferenceClient


class HuggingFaceLLM:
    def __init__(self, token: str, model: str):
        self.client = InferenceClient(
            token=token,
        )
        self.model = model

    def invoke(self, prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            temperature=0,
            max_tokens=256,
        )

        return response.choices[0].message.content
