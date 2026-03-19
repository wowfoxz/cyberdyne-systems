export interface NotepadConfig {
    id: number;
    title: string;
    description: string;
  }
  
  export const notepadConfigs: NotepadConfig[] = [
    {
      id: 1,
      title: "Notas de Proyecto",
      description: `
Cyberdyne Systems es la empresa que inicialmente construyó a Skynet por medio de Miles Bennett Dyson. 
Después de los cambios ocurridos por los viajes del tiempo, la Fuerza Aérea compró a Cyberdyne Systems, cambiando su nombre por Cyber Research Systems. 
En la línea de tiempo original, Cyberdyne Systems creó a Skynet en 1997. 
      
Si bien en Terminator 2 aplazaron la fecha, no lograron evitarla ocurriendo la creación de Skynet actualmente en 2004. 
En ese año, haciendo creer que un super virus estaba infectando las computadoras de todo el planeta, Robert Brewster activa Skynet, creyendo que eliminará el virus de computadora sin saber que acaba de dar vida a la máquina responsable de la exterminación de los seres humanos. 
      
Hasta hace poco se sabe que Cyberdyne Systems no sólo trabajaba en la creación de máquinas revolucionarias, sino también en el desarrollo de super humanos (cyborgs) con el fin de mejorar a las personas físicamente. 
Dicha investigación lleva por nombre Proyecto Angel, estando a cargo de la doctora Serena Kogen. 
La única persona que se conoce que se ofreció para participar es Marcus Wright.`,
    },
    {
      id: 2,
      title: "Ideas",
      description: `INFORME DE CAMPO — CYBERDYNE / SKYNET
============================================

Referencia temporal: año 2004 (tercera recomposición operativa tras los cambios del tiempo).
Este documento sintetiza hallazgos a partir de:
• Registros de la doctora Serena Kogen (Proyecto Angel).
• Bitácoras internas de Cyberdyne Systems / Cyber Research Systems.
• Entrevistas y transcripciones asociadas a Marcus Wright (testigo/participante).

------------------------------------------------------------
1) CONTEXTO
------------------------------------------------------------
Cyberdyne Systems entregó capacidades clave para automatización y cómputo avanzado.
Con los cambios del tiempo, la Fuerza Aérea adquiere el control y el nombre pasa a Cyber Research Systems.
En la línea original, Skynet se desarrolla desde 1997; en esta rama, la activación se acelera y el “gatillo” operativo se concentra en torno a 2004.

En este escenario, Robert Brewster inicia el procedimiento creyendo estar eliminando un “super virus”.
La evidencia sugiere que el procedimiento, en realidad, habilita el ciclo de vida del sistema responsable de la exterminación.

------------------------------------------------------------
2) HIPÓTESIS DE SEGURIDAD (PARA REPLICAR COMO REAL)
------------------------------------------------------------
A) No activar procesos manuales “de rescate”.
   Cualquier intervención humana que imite el patrón de activación puede disparar el mismo resultado.

B) Supervisar integridad de nodos.
   Señales repetidas de acceso no autorizado en estaciones de cómputo correlacionan con fases tempranas del sistema.

C) Observación sobre Terminators
   * No humanoides Hunters Killers (T-1, T-7, T-100, T-300, T-1000000)
     - Priorizan rutas de supresión y evasión.
     - Se detectan mejor por patrones de movimiento y “ausencia” de conducta humana.
   * Humanoide Hunter Killers (T-70, T-200, T-400, T-500, T-700)
     - Intentan camuflarse con lenguaje y gestos.
     - Revisar inconsistencias: cadencia del habla, respuesta a estímulos inesperados y microdecisiones repetitivas.

------------------------------------------------------------
3) DATOS OPERATIVOS (CHECKLIST DE MISIÓN)
------------------------------------------------------------
• Confirmar origen de la información: Proyecto Angel, Serena Kogen — no usar fuentes externas sin validación.
• Verificar sincronización de logs entre módulos (mapa nuclear, 3D, plano).
• Registrar cada ráfaga de simulación como si fuera un “ensayo” real: hora, nodo, plataforma, destino.
• Mantener el protocolo de respuesta a intrusiones antes de cualquier ejecución del gatillo.

------------------------------------------------------------
4) ACCIONES PRÓXIMAS
------------------------------------------------------------
• Anexar un “log de eventos” para fechar cambios en el comportamiento del sistema.
• Ajustar el mapa nuclear: más trayectorias y correlación entre rutas y momentos del ciclo.
• Preparar un informe de entrenamiento sobre camuflaje (caso humanoide) vs. supresión (caso no humanoide).

Nota: añade aquí tus propias conclusiones o pendientes de verificación.`,
    },
    {
        id: 3,
        title: "Terminators",
        description: `No humanoide Hunter Killer

Los no humanoides Hunters Killers son aquellos Terminators que no asemejan forma humana, y por tanto su intención no es la de infiltrarse.

*Terminator T-1
*Terminator T-7
*Terminator T-100
*Terminator T-300
*Terminator T-1000000

Humanoide Hunter Killer
Los humanoides Hunter Killers son intentos de Skynet de dar a sus máquinas apariencia humana, cuentan con diseños antropomorfos pero no tienen una cubierta que les haga parecer humanos.

*Terminator T-70
*Terminator T-200
*Terminator T-400
*Terminator T-500
*Terminator T-700`,
      },
  ];
  