# TEM Bakehouse: images and 3D models to generate

Drop each file at the path shown (inside `public/`). The site checks for every file when it loads. Once a file is there, it replaces the stand-in automatically. You don't need to change any code or restart anything. Refresh the page to see it.

The scroll-sequence hero frames are already in `public/assets/hero/`, so they're not on this list.

**Priority for the demo:** sections 1 and 2 (the six featured flavours) come first, then section 3 (categories). Everything after that is optional polish.

---

## Style lock: paste this at the start of every image chat

> Photorealistic commercial food photography for TEM Bakehouse, a small artisan cookie bakery in Mauritius. Thick bakery-style cookies about 9 cm across and 2 cm tall, slightly irregular edges, crackled tops, real handmade texture with natural oil sheen. Lighting: one large warm softbox key light from the upper left at 45° (3200K), a subtle warm rim light from behind right, gentle front fill, soft natural contact shadow. Colour grade: warm, rich, slightly moody. Brand palette for any background: deep burgundy #711D2C, cream #F0EED9, sand #E5DCC5. Not CGI, not plastic, not illustrated, not over-smoothed. No text, no logos, no hands, no props unless described.

**Rules for consistency**
- Generate all images for one flavour in **one chat**, so the cookie stays the same across its whole, broken and inside shots.
- If TEM has a real photo of the flavour, attach it and add *"Match the attached photo exactly for colour, size and inclusions."* Where the prompt and the photo disagree, follow the photo.
- Transparent PNGs: most generators can't produce real transparency. Generate on flat `#E5DCC5`, then cut out the background with remove.bg, Photoshop "Select Subject" or Photoroom. Keep the soft shadow.

---

## 1. Flavour Room 3D models: the 6 featured flavours

| Flavour | File |
|---|---|
| Choco Chips | `public/models/tem_choco-chips.glb` |
| Double Choco | `public/models/tem_double-choco.glb` |
| Red Velvet | `public/models/tem_red-velvet.glb` |
| Pistachio | `public/models/tem_pistachio.glb` |
| Bueno | `public/models/tem_bueno.glb` |
| Ferrero | `public/models/tem_ferrero.glb` |

These go in the homepage "Turn it. Break it. Choose it." section. While a flavour has no GLB, the site shows a procedural 3D cookie in that flavour's colours, so nothing breaks in the meantime.

### Technical spec (important)
- **Format:** `.glb` (binary glTF 2.0) with PBR textures embedded. Use base colour, normal and roughness maps, at 2048 px or less.
- **Size:** under 5 MB per file and under ~60k triangles. Don't use Draco compression; the loader doesn't include a decoder.
- **Orientation:** Y-up, with the cookie lying flat and its top facing +Y. The site centres and scales the model automatically, so the real-world scale doesn't matter.
- **"Break it open" support:** to make the cookie split in two when the visitor taps *Break it open*, the GLB must contain **two separate objects named `cookie_left` and `cookie_right`**: the two halves of one cookie, put back together so it looks whole. The site pulls them apart and tilts them, and the crumbs burst out. If the model is a single piece, it still turns and wobbles, but it won't split.

### How to make the two halves
1. Generate the **whole** cookie with the prompt below (Meshy, Tripo, Rodin/Hyper3D, or Hunyuan3D, either image-to-3D or text-to-3D).
2. In Blender, import it and select the mesh. Go to Edit Mode, select all, then choose *Mesh → Bisect*, with **Fill** on and **Clear Outer** off. Then press `P` and choose *Separate by loose parts*. That gives you two halves along a straight line. For a jagged, realistic break, use the *Knife* tool (`K`) and draw a zig-zag line across the cookie instead of Bisect.
3. Rename the two objects to `cookie_left` and `cookie_right`.
4. Optional: give the new cut faces a lighter, crumbly "inside" material.
5. *File → Export → glTF 2.0 (.glb)*, with *Include → Selected Objects* and *Format → glTF Binary*.

**Tip:** the most reliable source for image-to-3D is the `_whole.png` from section 2. Generate the image first, then feed it to the 3D tool.

### 3D prompts (text-to-3D, or add to an image-to-3D run)

**Choco Chips**
```
A single thick bakery-style chocolate chip cookie, photoreal, about 9 cm wide and 2 cm tall, round with a slightly irregular edge. Golden-brown dough with a crackled, domed top and lighter cracks, generous semi-sweet chocolate chips and chunks partly sunk into the surface with a soft melted gloss. Realistic baked crumb texture, PBR materials, matte dough and slightly glossy chocolate. Flat underside. Single object, no plate, no base, no background.
```

**Double Choco**
```
A single thick bakery-style double chocolate cookie, photoreal, about 9 cm wide and 2 cm tall, round with a slightly irregular edge. Deep dark-brown cocoa dough with a crackled domed top, large dark chocolate chunks pressed into the surface with a melted glossy sheen. Realistic baked crumb texture, PBR materials, matte dough and glossy chocolate. Flat underside. Single object, no plate, no background.
```

**Red Velvet**
```
A single thick bakery-style red velvet cookie, photoreal, about 9 cm wide and 2 cm tall, round with a slightly irregular edge. Deep crimson-red dough with a crackled domed top showing slightly darker red cracks, scattered creamy white chocolate chips on the surface. Realistic baked crumb texture, PBR materials, matte dough and satin white chocolate. Flat underside. Single object, no plate, no background.
```

**Pistachio**
```
A single thick bakery-style pistachio cookie, photoreal, about 9 cm wide and 2 cm tall, round with a slightly irregular edge. Pale golden buttery dough with a faint green tint and a crackled domed top, flecked with chopped bright-green pistachio pieces on and in the surface. Realistic baked crumb texture, PBR materials, matte dough. Flat underside. Single object, no plate, no background.
```

**Bueno**
```
A single thick bakery-style hazelnut cream cookie inspired by wafer-and-hazelnut chocolate bars, photoreal, about 9 cm wide and 2 cm tall. Light golden dough with a crackled domed top, a drizzle of milk-chocolate hazelnut cream, a few pieces of crisp wafer and milk chocolate chunks pressed into the top. No branding or logos. Realistic baked crumb texture, PBR materials. Flat underside. Single object, no plate, no background.
```

**Ferrero**
```
A single thick bakery-style chocolate hazelnut cookie inspired by gold-wrapped hazelnut pralines, photoreal, about 9 cm wide and 2 cm tall. Medium-brown cocoa-hazelnut dough with a crackled domed top, whole roasted hazelnuts and chopped hazelnut pieces, dark chocolate chunks and a light dusting of crushed wafer. No wrappers, no branding. Realistic baked crumb texture, PBR materials. Flat underside. Single object, no plate, no background.
```

---

## 2. Flavour photos: whole, broken and inside

These are used on the menu cards, the order drawer, the account pages, the product page gallery and the Flavour Room when there's no GLB.

For each flavour, the files go in `public/assets/products/{flavour}/`:

| File | Size | Background | Where it shows |
|---|---|---|---|
| `tem_{flavour}_whole.png` | 1024×1024 | **Transparent** | Everywhere a cookie appears |
| `tem_{flavour}_broken.png` | 1024×1024 | **Transparent** | Product page "break" view, Flavour Room photo mode |
| `tem_{flavour}_crumb.png` | 1024×1024 | Opaque is fine | Product page "inside" view |

`{flavour}` is one of: `choco-chips`, `double-choco`, `red-velvet`, `pistachio`, `bueno`, `ferrero`, `plain`, `pinky`, `nutty-crunch`, `biscoff`, `salted-caramel`. Do the **six featured flavours first**.

### Prompt templates
Swap the `[FLAVOUR DESCRIPTION]` from the table below into each one.

**Whole**: `tem_{flavour}_whole.png`
```
One whole [FLAVOUR NAME] cookie by TEM Bakehouse: [FLAVOUR DESCRIPTION]. Three-quarter view from 35° above, cookie centred and filling 80% of the frame width. Hyper-realistic studio product photograph, 100mm lens, f/8, soft warm key light from the upper left, gentle rim light, soft natural contact shadow directly underneath. Perfectly plain flat #E5DCC5 background (to be cut out). Square 1:1. Real baked texture, imperfect edges, not CGI, no text, no props, no plate, no hands.
```

**Broken**: `tem_{flavour}_broken.png`
```
The same [FLAVOUR NAME] cookie broken by hand into two halves, the halves 2 cm apart and tipped slightly outward, both broken faces visible showing [INSIDE DESCRIPTION], 15–20 real crumbs scattered beneath and between them. Three-quarter view from 30° above, filling 88% of the frame width. Same lighting, colour and cookie as the previous image. Perfectly plain flat #E5DCC5 background (to be cut out). Square 1:1. Not CGI, no text, no props, no plate, no hands.
```

**Inside (macro)**: `tem_{flavour}_crumb.png`
```
Macro close-up of the broken face of the same [FLAVOUR NAME] cookie: [INSIDE DESCRIPTION], air pockets, a few crumbs falling. Fills the frame edge to edge, very shallow depth of field, warm backlight catching the crumb. Square 1:1. Not CGI, no text.
```

### Flavour descriptions

| Flavour | [FLAVOUR DESCRIPTION] | [INSIDE DESCRIPTION] |
|---|---|---|
| **Choco Chips** ★ | thick golden-brown dough with a crackled top and generous semi-sweet chocolate chips and chunks | soft golden crumb with molten chocolate pockets and glossy strands of melted chocolate |
| **Double Choco** ★ | thick dark cocoa dough with a crackled top and large dark chocolate chunks with a melted sheen | fudgy dark cocoa crumb with pools of molten dark chocolate |
| **Red Velvet** ★ | thick deep crimson-red dough with a crackled top and creamy white chocolate chips | moist deep-red crumb studded with soft white chocolate chips |
| **Pistachio** ★ | thick pale golden buttery dough with a faint green tint, flecked with chopped bright-green pistachios | buttery pale crumb with green pistachio pieces throughout |
| **Bueno** ★ | thick light golden dough with a hazelnut-cream drizzle, crisp wafer pieces and milk chocolate chunks, no branding | soft golden crumb with a ribbon of hazelnut cream and wafer crunch |
| **Ferrero** ★ | thick cocoa-hazelnut dough with whole roasted hazelnuts, dark chocolate chunks and crushed wafer, no wrappers or branding | rich cocoa crumb with chopped hazelnuts and melted chocolate-hazelnut centre |
| Plain | thick buttery golden dough with a crackled sugary top, no inclusions | tender buttery golden crumb |
| Pinky Cookie | thick soft blush-pink dough with a crackled top and pale white chocolate chips | soft pink crumb with white chocolate chips |
| Nutty Crunch | thick golden-brown dough packed with crunchy mixed nut pieces on and in the surface | golden crumb full of crunchy roasted nut pieces |
| Biscoff *(provisional)* | thick caramelised spiced-biscuit dough with crushed speculoos biscuit pieces and a cookie-butter drizzle, no branding | soft spiced crumb with a cookie-butter centre |
| Salted Caramel *(provisional)* | thick golden dough with amber caramel chunks and a few flakes of sea salt on top | soft golden crumb with oozing amber caramel |

★ = featured flavour (also needs a 3D model).

Biscoff and Salted Caramel have no real photo yet. TEM needs to approve those images before launch.

---

## 3. Category cards: "Six shapes of TEM" (homepage) — 6 images

Path: `public/assets/categories/tem_category_{id}_1200x1600.webp`. Portrait 3:4 at 1200×1600, exported as WebP quality 80. The top-left corner gets a large outlined number, so keep that area calm.

```
[STYLE LOCK] Portrait 3:4. [SUBJECT]. Shot from 40° above on a deep burgundy #711D2C seamless backdrop, subject in the lower two thirds of the frame, calm empty space in the top-left quarter. Warm, moody, editorial.
```

| id | [SUBJECT] |
|---|---|
| `round` | a loose stack of five thick TEM round cookies in mixed flavours (choco chips, red velvet, pistachio), the top one broken in half |
| `mini` | an open cream kraft box of 24 small bite-sized cookies in mixed flavours, a few spilling out |
| `cups` | three cookie-dough cups baked into a cup shape, filled with glossy chocolate ganache, one with a bite taken |
| `cakes` | one giant 28 cm cookie cake decorated with piped chocolate lettering reading "Happy Birthday" and small swirls of buttercream around the edge |
| `sticks` | eight long golden cookie sticks fanned out, two dipped halfway in melted chocolate, a small pot of chocolate dip beside them |
| `shots` | four cookie shot glasses (cookie dough baked into the shape of a small glass), two filled with cold milk, one with a drip down the side |

---

## 4. Moments cards: "What's the moment?" (homepage) — 4 images

Path: `public/assets/moments/tem_moment_{id}.webp`. Portrait 4:5 at 1200×1500, WebP quality 80. The bottom-left corner gets a large burgundy letter, so keep it uncluttered.

```
[STYLE LOCK] Portrait 4:5. [SCENE]. Soft natural window light, cream and warm-wood tones, shallow depth of field, lifestyle food photography. Keep the bottom-left corner uncluttered.
```

| id | [SCENE] |
|---|---|
| `birthday` | a personalised cookie cake on a cream table with a single lit candle, confetti and a slice cut out, a celebration just out of focus behind |
| `gift` | a box of six TEM cookies tied with a thin burgundy ribbon and a small blank gift tag, held over a linen tablecloth |
| `gathering` | a wooden table seen from above with mini cookies and cookie shots shared on platters, several hands reaching in (hands cropped at the wrist) |
| `treat` | a single chocolate chip cookie on a small plate next to a cup of coffee on a windowsill on an ordinary afternoon |

---

## 5. Gallery page — 12 images

Path: `public/assets/gallery/tem_gallery_01.webp` … `tem_gallery_12.webp`. WebP quality 80, long edge 1600 px. Use the aspect ratio listed. **Real TEM photos are better here.** Use AI only for the demo.

| # | Caption | Ratio | Prompt idea |
|---|---|---|---|
| 01 | Choco Chips, stacked | 3:4 | tall stack of choco chip cookies, burgundy backdrop |
| 02 | Morning bake | 1:1 | baking tray of freshly baked cookies, steam, overhead |
| 03 | Cookie cake, personalised | 4:5 | cookie cake with piped name, overhead |
| 04 | Red Velvet | 3:4 | red velvet cookie broken in half, white chips |
| 05 | Boxes ready | 1:1 | row of cream boxes with burgundy ribbon on a counter |
| 06 | Pistachio close-up | 4:3 | macro of pistachio cookie surface |
| 07 | Behind the counter | 3:4 | baker's hands shaping dough balls, flour dust (no face) |
| 08 | Mini cookies | 1:1 | handful of mini cookies in a paper cone |
| 09 | Cookie shots | 4:5 | cookie shots being filled with milk |
| 10 | Packing | 1:1 | cookies being placed in a box, overhead |
| 11 | Ferrero | 3:4 | Ferrero-style cookie with whole hazelnuts, moody |
| 12 | A celebration | 4:3 | party table with cookie cake and guests out of focus |

---

## 6. Other single images

| File | Spec | Prompt / note |
|---|---|---|
| `public/assets/editorial/tem_about_baker_1800x2400.webp` | 3:4, WebP | **Must be a real photo of TEM's baker.** Don't generate a person. Shot list: baker at the bench shaping dough, warm window light, apron, flour on hands. |
| `public/assets/brand/og/tem_og_1200x630.jpg` | 1200×630 JPG | Social share preview. Prompt: `[STYLE LOCK] Landscape 1.91:1. A Choco Chips cookie broken in half with molten chocolate strands, positioned in the right two thirds, deep burgundy backdrop, empty left third for the logo.` Then put the cream TEM logo on the left third. |

---

## Checklist

- [ ] 6 GLB models with `cookie_left` / `cookie_right` halves, in `public/models/`
- [ ] 6 featured flavours × `_whole.png` / `_broken.png` / `_crumb.png`
- [ ] 5 other flavours × 3 images
- [ ] 6 category cards
- [ ] 4 moment cards
- [ ] 12 gallery images (real photos preferred)
- [ ] Baker photo (real) and OG image
