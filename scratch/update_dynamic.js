const fs = require('fs');

// 1. Add Related Safaris to safari-detail.html
let html = fs.readFileSync('views/safari-detail.html', 'utf8');
if (!html.includes('id="relatedSafaris"')) {
    const relatedSection = `
<section class="section bg-sand" id="relatedSafaris" style="display:none; padding:4rem 0">
  <div class="container">
    <h2 style="font-family:var(--font-heading);margin-bottom:2rem;text-align:center">You May Also Like</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(300px, 1fr));gap:2rem" id="relatedGrid"></div>
  </div>
</section>
`;
    html = html.replace('</section>\n\n<!-- Footer -->', '</section>\n\n' + relatedSection + '\n\n<!-- Footer -->');
    fs.writeFileSync('views/safari-detail.html', html);
    console.log('Added relatedSafaris to safari-detail.html');
}

// 2. Make Travel Tips dynamic in destination-detail.js
let js = fs.readFileSync('public/js/destination-detail.js', 'utf8');

const tipsFn = `
function getTravelTips(name) {
    const lowerName = name.toLowerCase();
    let tips = [];
    if (lowerName.includes('serengeti')) {
        tips = [
            { icon: 'fa-camera', text: 'Incredible migration photography' },
            { icon: 'fa-sun', text: 'Very hot at midday, dress in layers' },
            { icon: 'fa-car', text: 'Expect long game drives' },
            { icon: 'fa-binoculars', text: 'Binoculars are essential for predators' }
        ];
    } else if (lowerName.includes('ngorongoro')) {
        tips = [
            { icon: 'fa-snowflake', text: 'Crater rim is very cold in mornings' },
            { icon: 'fa-camera', text: 'Incredible lighting at dawn' },
            { icon: 'fa-binoculars', text: 'Look out for the Black Rhino' },
            { icon: 'fa-car', text: 'Steep descent into the crater' }
        ];
    } else if (lowerName.includes('kilimanjaro')) {
        tips = [
            { icon: 'fa-hiking', text: 'Sturdy hiking boots required' },
            { icon: 'fa-temperature-low', text: 'Thermal gear is essential' },
            { icon: 'fa-tint', text: 'Drink 3-4 liters of water daily' },
            { icon: 'fa-walking', text: '\\'Pole pole\\' (slowly slowly) is key' }
        ];
    } else if (lowerName.includes('zanzibar')) {
        tips = [
            { icon: 'fa-swimmer', text: 'Reef shoes recommended for low tide' },
            { icon: 'fa-tshirt', text: 'Dress modestly in Stone Town' },
            { icon: 'fa-sun', text: 'Reef-safe sunscreen is a must' },
            { icon: 'fa-camera', text: 'Amazing sunset photography' }
        ];
    } else {
        tips = [
            { icon: 'fa-camera', text: 'Best for photography' },
            { icon: 'fa-binoculars', text: 'Guided tours available' },
            { icon: 'fa-car', text: '4x4 vehicles recommended' },
            { icon: 'fa-umbrella', text: 'Sun protection essential' }
        ];
    }
    return tips.map(t => '<li><i class="fas ' + t.icon + '"></i> ' + t.text + '</li>').join('');
}
`;

if (!js.includes('function getTravelTips')) {
    js += '\n' + tipsFn;
    
    // The exact regex to replace the hardcoded list
    const regex = /<ul>\s*<li><i class="fas fa-camera"><\/i> Best for photography<\/li>\s*<li><i class="fas fa-binoculars"><\/i> Guided tours available<\/li>\s*<li><i class="fas fa-car"><\/i> 4x4 vehicles recommended<\/li>\s*<li><i class="fas fa-umbrella"><\/i> Sun protection essential<\/li>\s*<\/ul>/;
    js = js.replace(regex, '<ul id="travelTipsList">${getTravelTips(name)}</ul>');
    
    fs.writeFileSync('public/js/destination-detail.js', js);
    console.log('Made Travel Tips dynamic in destination-detail.js');
}
