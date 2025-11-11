// assets/js/data.js
(function () {
  const QUESTIONS = [
    {
      id: "age",
      q: "¿Cuál es tu rango de edad?",
      opts: ["16-18 años", "19-25 años", "25-29 años", "+29 años", "+40 años"],
    },
    {
      id: "studies",
      q: "¿Qué estudios has completado?",
      opts: [
        "ESO",
        "Bachillerato",
        "Ciclo Formativo Grado Medio",
        "Ciclo Formativo Grado Superior",
        "Universidad / Máster",
      ],
    },
    {
      id: "type",
      q: "¿Qué tipo de trabajo te motiva más?",
      opts: [
        "Seguridad y acción",
        "Administración / gestión",
        "Docencia y formación",
        "Tecnología y planificación",
      ],
    },
    {
      id: "mode",
      q: "¿Cómo prefieres estudiar?",
      opts: ["100% Online", "Presencial"],
    },
    {
      id: "hours",
      q: "¿Cuántas horas puedes dedicar al estudio?",
      opts: ["Menos de 10h", "10-20h", "Más de 20h"],
    },
    {
      id: "social",
      q: "¿Quieres un trabajo con contacto directo con personas?",
      opts: ["Sí", "No"],
    },
    {
      id: "goal",
      q: "¿Qué valoras más en tu futura oposición?",
      opts: [
        "Estabilidad laboral y salario",
        "Crecimiento profesional",
        "Impacto social / vocación docente",
      ],
    },
    {
      id: "form",
      q: "Déjanos tus datos y te enviaremos tu resultado",
      opts: [],
    },
  ];

  function freshScore() {
    return {
      PREFORTIA: 0,
      JURISPOL: 0,
      FORVIDE: 0,
      AGE360: 0,
      MÉTODOS: 0,
      DOZENTY: 0,
      __juris: { Básica: 0, Ejecutiva: 0 },
      __age360: null, // 'Auxiliar' | 'Administrativo'
      __flags: {
        over29: false,
        hasUni: false,
        wantsGestion: false,
        wantsDocTec: false,
        horasMenos10: false,
      },
    };
  }

  function normalize(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function applyScoring(score, choice) {
    const id = choice.id;
    const v = normalize(choice.value);

    // Helpers to award
    const add = (name, pts = 1) => {
      if (score[name] !== undefined) score[name] += pts;
    };
    const juris = (scale) => {
      add("JURISPOL");
      if (score.__juris && score.__juris[scale] !== undefined)
        score.__juris[scale] += 1;
    };

    switch (id) {
      case "age": {
        // PREFORTIA
        if (
          ["19-25 años", "25-29 años", "+29 años"].some(
            (s) => normalize(s) === v
          )
        )
          add("PREFORTIA");
        // JURISPOL (with scale)
        if (normalize("16-18 años") === v) juris("Básica");
        if (normalize("19-25 años") === v) juris("Básica");
        if (normalize("25-29 años") === v) {
          juris("Básica");
          juris("Ejecutiva");
        }
        if (normalize("+29 años") === v || normalize("+40 años") === v) {
          juris("Ejecutiva");
          score.__flags.over29 = true;
        }
        // FORVIDE
        if (
          [
            "16-18 años",
            "19-25 años",
            "25-29 años",
            "+29 años",
            "+40 años",
          ].some((s) => normalize(s) === v)
        )
          add("FORVIDE");
        // AGE360
        if (
          [
            "16-18 años",
            "19-25 años",
            "25-29 años",
            "+29 años",
            "+40 años",
          ].some((s) => normalize(s) === v)
        )
          add("AGE360");
        // MÉTODOS
        if (
          ["16-18 años", "19-25 años", "25-29 años"].some(
            (s) => normalize(s) === v
          )
        )
          add("MÉTODOS");
        // DOZENTY
        if (
          ["19-25 años", "25-29 años", "+29 años", "+40 años"].some(
            (s) => normalize(s) === v
          )
        )
          add("DOZENTY");
        break;
      }
      case "studies": {
        // PREFORTIA: todas válidas
        if (
          [
            "ESO",
            "Bachillerato",
            "Ciclo Formativo Grado Medio",
            "Ciclo Formativo Grado Superior",
            "Universidad / Máster",
          ].some((s) => normalize(s) === v)
        )
          add("PREFORTIA");

        // JURISPOL escalas
        if (normalize("ESO") === v) juris("Básica");
        if (
          [
            "Bachillerato",
            "Ciclo Formativo Grado Medio",
            "Ciclo Formativo Grado Superior",
          ].some((s) => normalize(s) === v)
        ) {
          juris("Básica");
          juris("Ejecutiva");
        }
        if (normalize("Universidad / Máster") === v) {
          juris("Ejecutiva");
          score.__flags.hasUni = true;
        }

        // FORVIDE: todas válidas
        if (
          [
            "ESO",
            "Bachillerato",
            "Ciclo Formativo Grado Medio",
            "Ciclo Formativo Grado Superior",
            "Universidad / Máster",
          ].some((s) => normalize(s) === v)
        )
          add("FORVIDE");

        // AGE360: todas válidas (sumar puntos) + rama por estudios
        if (
          [
            "ESO",
            "Bachillerato",
            "Ciclo Formativo Grado Medio",
            "Ciclo Formativo Grado Superior",
            "Universidad / Máster",
          ].some((s) => normalize(s) === v)
        ) {
          add("AGE360");
          if (normalize("ESO") === v) {
            score.__age360 = "Auxiliar";
          } else {
            // Bachillerato o superior
            score.__age360 = "Administrativo";
          }
        }

        // MÉTODOS: todas válidas
        if (
          [
            "ESO",
            "Bachillerato",
            "Ciclo Formativo Grado Medio",
            "Ciclo Formativo Grado Superior",
            "Universidad / Máster",
          ].some((s) => normalize(s) === v)
        )
          add("MÉTODOS");

        // DOZENTY: solo Uni/Máster
        if (normalize("Universidad / Máster") === v) add("DOZENTY");
        break;
      }
      case "type": {
        if (normalize("Seguridad y acción") === v) {
          add("PREFORTIA");
          juris("Básica");
          add("FORVIDE");
          add("MÉTODOS");
        }
        if (normalize("Administración / gestión") === v) {
          add("AGE360");
          juris("Ejecutiva");
          score.__flags.wantsGestion = true;
          add("FORVIDE");
        }
        if (normalize("Docencia y formación") === v) {
          add("PREFORTIA");
          juris("Ejecutiva");
          score.__flags.wantsDocTec = true;
          add("DOZENTY");
        }
        if (normalize("Tecnología y planificación") === v) {
          juris("Ejecutiva");
          score.__flags.wantsDocTec = true;
        }
        break;
      }
      case "mode": {
        if (normalize("100% Online") === v) {
          add("PREFORTIA");
          juris("Básica");
          juris("Ejecutiva");
          add("FORVIDE");
          add("AGE360");
          add("MÉTODOS");
          add("DOZENTY");
        }
        if (normalize("Presencial") === v) {
          juris("Básica");
          juris("Ejecutiva");
          add("FORVIDE");
        }
        break;
      }
      case "hours": {
        if (normalize("Menos de 10h") === v) {
          juris("Ejecutiva");
          add("MÉTODOS");
          score.__flags.horasMenos10 = true;
        }
        if (normalize("10-20h") === v) {
          add("PREFORTIA");
          juris("Básica");
          add("FORVIDE");
          add("AGE360");
          add("DOZENTY");
        }
        if (normalize("Más de 20h") === v) {
          add("PREFORTIA");
          juris("Básica");
          add("FORVIDE");
          add("DOZENTY");
        }
        break;
      }
      case "social": {
        if (normalize("Sí") === v || normalize("Si") === v) {
          add("PREFORTIA");
          juris("Básica");
          juris("Ejecutiva");
          add("FORVIDE");
          add("AGE360");
          add("MÉTODOS");
          add("DOZENTY");
        }
        if (normalize("No") === v) {
          add("FORVIDE");
          add("AGE360");
        }
        break;
      }
      case "goal": {
        if (normalize("Estabilidad laboral y salario") === v) {
          add("PREFORTIA");
          juris("Básica");
          juris("Ejecutiva");
          add("FORVIDE");
          add("AGE360");
        }
        if (normalize("Crecimiento profesional") === v) {
          add("PREFORTIA");
          juris("Ejecutiva");
          add("AGE360");
          add("MÉTODOS");
        }
        if (normalize("Impacto social / vocación docente") === v) {
          add("PREFORTIA");
          juris("Ejecutiva");
          add("MÉTODOS");
          add("DOZENTY");
        }
        break;
      }
    }
  }

  function winner(score) {
    const entries = Object.entries(score).filter(([k]) => !k.startsWith("__"));
    entries.sort((a, b) => b[1] - a[1]);
    const top1Key = entries[0] ? entries[0][0] : null;
    const top2Key = entries[1] && entries[1][1] > 0 ? entries[1][0] : null;

    // Jurispol scale decoration
    let finalTop1 = top1Key;
    if (top1Key === "JURISPOL") {
      const b = (score.__juris && score.__juris["Básica"]) || 0;
      const e = (score.__juris && score.__juris["Ejecutiva"]) || 0;
      let scale = null;
      if (e > b) scale = "Escala Ejecutiva";
      else if (b > e) scale = "Escala Básica";
      else {
        // tie-breaker heuristics
        if (
          score.__flags.hasUni ||
          score.__flags.over29 ||
          score.__flags.wantsGestion ||
          score.__flags.wantsDocTec ||
          score.__flags.horasMenos10
        ) {
          scale = "Escala Ejecutiva";
        } else {
          scale = "Escala Básica";
        }
      }
      finalTop1 = `JURISPOL – ${scale}`;
    }

    // AGE360 branch decoration
    if (top1Key === "AGE360") {
      const rama = score.__age360 || "Administrativo";
      finalTop1 = `AGE360 – ${rama}`;
    }

    return { top1: finalTop1, top2: top2Key };
  }

  function bullets(name) {
    // Map decorated names back to base for bullets
    const base =
      name && name.startsWith("JURISPOL")
        ? "JURISPOL"
        : name && name.startsWith("AGE360")
        ? "AGE360"
        : name;

    switch (base) {
      case "PREFORTIA":
        return [
          "Ritmo online flexible",
          "Enfoque práctico y directo",
          "Acompañamiento cercano",
        ];
      case "JURISPOL":
        return [
          "Itinerarios por escala",
          "Material actualizado y tests",
          "Tutoría especializada",
        ];
      case "FORVIDE":
        return [
          "Versatilidad de perfiles",
          "Modalidad online o presencial",
          "Plan de estudio progresivo",
        ];
      case "AGE360": {
        // Personaliza un poco los bullets según la rama detectada
        const rama =
          name && name.includes("–") ? name.split("–")[1].trim() : null;
        if (rama === "Auxiliar") {
          return [
            "Acceso con ESO",
            "Funciones de apoyo administrativo",
            "Opciones de promoción interna",
          ];
        }
        return [
          "Requiere Bachillerato o superior",
          "Tareas administrativas",
          "Equilibrio vida-trabajo",
        ];
      }
      case "MÉTODOS":
        return [
          "Aprendizaje ágil",
          "Clases 100% online",
          "Enfoque al crecimiento",
        ];
      case "DOZENTY":
        return [
          "Vocación docente",
          "Metodología online",
          "Itinerario pedagógico",
        ];
      default:
        return [
          "Itinerario recomendado",
          "Formación guiada",
          "Acompañamiento experto",
        ];
    }
  }

  window.QRData = { QUESTIONS, freshScore, applyScoring, winner, bullets };
})();
