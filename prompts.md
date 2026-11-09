# Prompts de Production Master — Film d'Entreprise : Atelier Grafrika
> **Projet :** Présentation Officielle — Atelier Grafrika (Architecture, Design d'Espace & BTP)  
> **Axe :** Présentation percutante de l'entreprise, de ses 3 pôles d'expertise et de sa promesse clé en main.  
> **Contraintes :** **Zéro ville mentionnée**, **Zéro musique**, 100% Foley identitaire et voix-off assurée, motifs géométriques africains.

---

## 1. 🤖 Prompts Visuels IA (Runway Gen-3 Alpha / Kling 1.5 / Midjourney v6)

### Clip A : Le Logo & L'Origami Claustra 3D (Secondes 00:00 - 05:00)
> **Objectif :** Présenter le cabinet Atelier Grafrika à travers une grille de claustras géométriques africains en terre cuite et or qui s'ouvre vers l'écran.
>
> **Prompt Runway Gen-3 Alpha / Kling 1.5 :**
> ```text
> High-speed dynamic continuous camera zoom-through entering an intricate geometric African terracotta claustra ventilation screen wall, inspired by royal geometric patterns. The terracotta tiles fold open in a precise 3D mechanical origami motion like a luxury camera aperture, trimmed with polished brass and gold leaf along the beveled edges. Camera flies seamlessly through the central opening past floating golden dust particles and warm sunbeams into a breathtaking monumental tropical luxury villa. Monumental double-height ceilings, fair-faced concrete, teak wood pergolas, lush exotic tropical vegetation. Cinematic motion blur, 60fps feel, photorealistic 8k, majestic architecture, award-winning cinematography. --ar 9:16
> ```

---

### Clip B : Pôle Design d'Espace & Matières Nobles (Secondes 11:20 - 17:00)
> **Objectif :** Montrer le pôle intérieur d'Atelier Grafrika (bois d'Iroko, claustras, lumière tamisée).
>
> **Prompt Runway Gen-3 Alpha / Kling 1.5 :**
> ```text
> Cinematic smooth camera panning through a luxury contemporary African interior living space, vertical 9:16. Rich warm local Iroko hardwood millwork, bespoke architectural furniture, perforated terracotta claustra screen walls casting sharp artistic linear shadows on polished cream stone floors. A glimpse of lush tropical garden outside floor-to-ceiling glass doors. Architectural Digest style, warm soft daylight, hyper-detailed textures, 8k resolution. --ar 9:16
> ```

---

### Clip C : Pôle BTP & Ingénierie Terrain (Secondes 17:00 - 23:50)
> **Objectif :** Démontrer la rigueur de construction et le respect du budget/délais.
>
> **Prompt Runway Gen-3 Alpha / Kling 1.5 :**
> ```text
> High-end technical cinematic tracking shot on an immaculate, modern luxury residential construction site in Africa, vertical 9:16 format. Two distinguished African civil engineers in crisp white safety helmets and tailored high-visibility vests inspecting laser-leveled concrete formwork with a digital tablet and an optical level. Impeccable structural steel reinforcement, clean construction site, bright warm daylight, volumetric sunbeams through architectural openings. Steady fluid gimbal motion, corporate documentary excellence, ultra-realistic 4k. --ar 9:16
> ```

---

## 2. 🎙️ Prompt Voix-Off (ElevenLabs Multilingual v2)

* **Directives d'Interprétation :**
  * **Profil Vocal :** Voix d'ambassadeur de marque / dirigeant de cabinet d'architecture (35-45 ans). Ton confiant, fier, chaleureux, articulé et parfaitement posé.
  * **Prise de son :** Micro studio de proximité extrême (*Proximity Effect*), son **100% sec (zéro réverbération)** pour capter l'intimité et la texture des respirations.
* **Réglages ElevenLabs :**
  * Stability : `62%`
  * Clarity / Similarity : `90%`
  * Style Exaggeration : `8%`

* **Texte Minuté avec Silences Marqués (100% Centré sur l'Entreprise) :**
```text
[0.0s] (Chaleureux, solennel) Vous avez une vision. [pause 0.2s] Nous lui donnons vie. Bienvenue à l'Atelier Grafrika.
[5.0s] (Dynamique, noble) Premier pôle : notre cabinet d'architecture. Nous concevons votre chef-d'œuvre sur-mesure, pensé pour valoriser durablement votre investissement.
[11.2s] (Élégant, posé) Deuxième pôle : le design d'espace. Nous sculptons vos intérieurs avec des matières nobles pour allier confort moderne et identité africaine.
[17.0s] (Autorité technique, tranchant) Troisième pôle : notre entreprise générale de BTP. Du gros œuvre à la remise des clés, votre budget et vos délais sont garantis.
[23.5s] (Souverain, affirmé) Un seul interlocuteur. Une maîtrise totale. Bâtissez l'excellence avec l'Atelier Grafrika.
[27.0s] (Direct, accueillant) Vous avez un projet à concrétiser ? Contactez l'Atelier Grafrika sur WhatsApp dès aujourd'hui.
```

---

## 3. 🔊 Prompts Foley & Sound Effects Identitaires (ElevenLabs SFX / Splice)

Générez ou intégrez chaque bruitage organique sans musique :

1. **Le Traçage sur Calque (00.15s) :**  
   `ASMR ultra-close recording of a heavy 4B graphite architect pencil scratching firmly across textured heavy tracing paper, crisp dry drawing sound, no reverb.`
2. **Le Gongon en Fer Forgé (00.60s & 24.80s) :**  
   `Single resonant, majestic ceremonial strike on a traditional West African hand-forged iron bell, raw metallic harmonic overtones, slow acoustic decay, solemn authority.`
3. **Le Choc des Briques de Claustra (02.20s) :**  
   `Heavy solid dry clack and earthy thud of two terracotta clay masonry blocks being fitted together firmly on sand, rich tactile texture.`
4. **Le Bip Télémètre Laser (05.00s) :**  
   `Sharp electronic high-precision laser measuring tool beep, clean dry acoustic.`
5. **L'Assemblage Bois d'Iroko (13.50s) :**  
   `Clean solid wooden knock of heavy exotic hardwood being fitted into a wooden joint, rich acoustic resonance.`
6. **Le Vrombissement FPV & Tampon BTP (17.00s & 21.20s) :**  
   `Subtle low-frequency hum of a drone combined with a heavy wooden legal stamp slamming down on thick parchment paper, official executive validation sound.`
7. **Le Ruban Métallique Final (29.80s) :**  
   `Rapid retraction zip of a heavy-duty construction metal tape measure ending with a loud, snappy mechanical metallic click.`

---

## 4. 💻 Intégration du Moteur Remotion

Dans votre composant Remotion, la timeline synchronise chaque pôle d'expertise avec les balises `<Audio />` de foley sans piste musicale :

```tsx
// src/Composition.tsx
import { Audio, Sequence, staticFile } from 'remotion';
import cues from '../project/cues.json';

export const SpotAtelierGrafrika = () => {
  return (
    <div style={{ width: 1080, height: 1920, backgroundColor: '#FAF8F5' }}>
      {/* 1. Voix-Off Présentation d'Entreprise */}
      <Audio src={staticFile('audio/voix_presentation_atelier_grafrika.mp3')} volume={1.0} />

      {/* 2. Piste Foley Identitaire (Zéro musique) */}
      <Audio src={staticFile('sfx/pencil_4b.wav')} startAt={cues.foley_pencil_calque * 60} volume={0.8} />
      <Audio src={staticFile('sfx/gongon_iron_bell.wav')} startAt={cues.gongon_brand_strike * 60} volume={1.0} />
      <Audio src={staticFile('sfx/terracotta_thud.wav')} startAt={cues.brand_name_hit * 60} volume={0.85} />
      <Audio src={staticFile('sfx/laser_beep.wav')} startAt={cues.laser_blueprint_scan * 60} volume={0.7} />
      <Audio src={staticFile('sfx/iroko_wood_clack.wav')} startAt={cues.wood_stone_clack * 60} volume={0.85} />
      <Audio src={staticFile('sfx/legal_stamp_thud.wav')} startAt={cues.stamp_certified_turnkey * 60} volume={1.0} />
      <Audio src={staticFile('sfx/gongon_final.wav')} startAt={cues.gongon_signature_decay * 60} volume={0.95} />
      <Audio src={staticFile('sfx/metal_tape_snap.wav')} startAt={cues.tape_measure_snap * 60} volume={0.9} />

      {/* 3. Séquences Visuelles des 3 Pôles Grafrika */}
      {/* Pôle 1: Architecture (0s - 11.2s) */}
      {/* Pôle 2: Design d'Espace (11.2s - 17s) */}
      {/* Pôle 3: BTP & Exécution (17s - 23.5s) */}
      {/* Signature & CTA (23.5s - 30s) */}
    </div>
  );
};
```
