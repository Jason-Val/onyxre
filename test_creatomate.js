const url = 'https://api.creatomate.com/v2/renders';
const apiKey = '13c02a0455754cfbb5e7a1f9506ae59a05d87dee6e38d332d0b129c319e523af0685a9977b62b69c5d6c53af98ccd932';

const data = {
  "template_id": "f9f05e2d-7d1a-446b-8c2e-7c5cf897a9fe",
  "modifications": {
    "Bottom_Black_Floor.fill_color": "rgba(0,0,0,0.6)",
    "Text-Address.text": "123 Main St, Manteca CA 95337",
    "Text-Price.text": "$1,050,000",
    "Stats_Text.text": "4 bd  |  2 ba  |  1,300 sqft",
    "Text-Agent-License.text": "DRE #02043628",
    "Text-Agent-Name.text": "Veronica Smith",
    "Agent_Headshot.source": "https://creatomate.com/files/assets/3de6151b-3b62-45c9-95f5-0f3c08641aa9"
  }
};

fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
})
  .then(response => response.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(error => console.error('Error:', error));
