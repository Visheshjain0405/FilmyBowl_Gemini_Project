# app.py

# -----------------------------
# Suppress unnecessary warnings
# -----------------------------
import warnings
warnings.filterwarnings("ignore", category=UserWarning)  # Hugging Face warnings
warnings.filterwarnings("ignore", category=FutureWarning)  # Optional: future warnings

# -----------------------------
# Import required libraries
# -----------------------------
from transformers import PegasusForConditionalGeneration, PegasusTokenizer
import torch

# -----------------------------
# Load the Pegasus paraphrase model
# -----------------------------
MODEL_NAME = "tuner007/pegasus_paraphrase"

print("Loading Pegasus model... This may take a minute the first time.")
tokenizer = PegasusTokenizer.from_pretrained(MODEL_NAME)
model = PegasusForConditionalGeneration.from_pretrained(MODEL_NAME)
print("Model loaded successfully!")

# -----------------------------
# Paraphrase function
# -----------------------------
def paraphrase(text, num_return_sequences=1, num_beams=5):
    """
    Paraphrases the input text.
    
    Args:
        text (str): Input text to paraphrase.
        num_return_sequences (int): How many paraphrases to return.
        num_beams (int): Beam search size for generating paraphrases.
    
    Returns:
        list: Paraphrased text(s)
    """
    # Tokenize the input text
    tokens = tokenizer(text, truncation=True, padding="longest", return_tensors="pt")
    
    # Generate paraphrased tokens
    paraphrased_tokens = model.generate(
        **tokens,
        max_length=120,  # Increased for longer paragraphs
        num_beams=num_beams,
        num_return_sequences=num_return_sequences,
        temperature=1.5
    )
    
    # Decode tokens back to text
    paraphrased_texts = [tokenizer.decode(t, skip_special_tokens=True) for t in paraphrased_tokens]
    return paraphrased_texts

# -----------------------------
# AI-to-Human Conversion Example
# -----------------------------
if __name__ == "__main__":
    # Original AI-generated article about Prabhas
    ai_text = """
Prabhas Raju Uppalapati, popularly known simply as Prabhas, is one of the most celebrated actors in Indian cinema, renowned for his commanding screen presence and versatile acting skills. Born on October 23, 1979, in Chennai, India, Prabhas hails from a family deeply rooted in the film industry. His uncle, Krishnam Raju, is a veteran Telugu actor, which gave Prabhas early exposure to cinema. Over the years, Prabhas has evolved into a pan-Indian icon, captivating audiences not only in Telugu cinema but across the country and internationally.

Prabhas made his acting debut in 2002 with the Telugu film “Eeswar”, directed by Jayanth C. Paranjee. Though the film received a moderate response, it laid the foundation for his career. He gained significant attention with the film “Varsham” (2004), a romantic action drama that showcased his acting potential and marked him as a rising star in the Telugu film industry. Following this, he starred in several successful films like “Chatrapathi” (2005) and “Billa” (2009), which solidified his reputation as a talented and bankable actor.

However, the turning point in Prabhas’s career came with S.S. Rajamouli’s epic saga “Baahubali”, which released in two parts: “Baahubali: The Beginning” (2015) and “Baahubali 2: The Conclusion” (2017). Playing the titular role of Amarendra Baahubali and Mahendra Baahubali, Prabhas’s performance received worldwide acclaim. The films became monumental successes, breaking box office records across India and globally. With “Baahubali 2”, Prabhas became the first Indian actor whose film crossed ₹1,800 crores at the box office, earning him immense popularity and recognition beyond the regional film audience. His dedication to the role, including a strict fitness regime and commitment to a three-year shooting schedule, highlighted his professionalism and passion for cinema.

Following the massive success of Baahubali, Prabhas aimed to consolidate his position as a pan-Indian star. He took on diverse roles in films like “Saaho” (2019), an action thriller that catered to audiences nationwide and showcased his adaptability in contemporary high-octane cinema. Despite mixed critical reception, Saaho performed well commercially, further proving Prabhas’s widespread appeal. He also starred in “Radhe Shyam” (2022), a romantic drama that emphasized his versatility and ability to connect emotionally with the audience.

Prabhas is known not only for his on-screen charisma but also for his off-screen persona. Often described as humble, grounded, and down-to-earth, he maintains a close connection with his fans. His fan base spans across India and abroad, with admirers from Tamil Nadu, Kerala, Karnataka, and even international markets like the United States and the Middle East. Prabhas’s popularity is such that his film releases are highly anticipated events, drawing massive crowds and media attention.

Looking ahead, Prabhas has several exciting projects lined up. Films like “Adipurush”, a mythological drama based on the Ramayana, and “Salaar”, an action-packed thriller, are creating a lot of buzz among fans and critics alike. These projects are expected to showcase new dimensions of his acting prowess and further establish him as one of the leading actors in Indian cinema.

In conclusion, Prabhas’s journey from a promising Telugu actor to a national and international star is a testament to his hard work, dedication, and natural talent. With a string of blockbuster films and a growing pan-Indian appeal, Prabhas continues to redefine the standards of stardom in Indian cinema. His journey serves as an inspiration for aspiring actors, demonstrating that commitment and perseverance can turn talent into legacy. Whether in romantic dramas, action-packed blockbusters, or mythological epics, Prabhas remains one of the most influential and admired figures in contemporary Indian cinema.
"""

    # Split into paragraphs for long-article processing
    paragraphs = [p.strip() for p in ai_text.split("\n\n") if p.strip()]
    human_paragraphs = []

    print("\nConverting AI text to more human-like text...\n")

    # Paraphrase each paragraph separately
    for p in paragraphs:
        human_version = paraphrase(p, num_return_sequences=1, num_beams=7)[0]
        human_paragraphs.append(human_version)

    # Combine into final human-like article
    human_text = "\n\n".join(human_paragraphs)

    print("==== Human-like Article ====\n")
    print(human_text)
