# BDAutos - Proyecto 1ª Evaluación (Bases de Datos Avanzadas)

**Universidad Autónoma de Chihuahua (UACH)**  
**Facultad de Ingeniería**  
**Docente:** Jose Saul De Lira Miramontes  
**Grupo:** 5K2  

### Integrantes
* Edgar Alejandro Gutierrez Carrillo (385655)
* Emilio Gallardo Medrano (385530)
* Carlos Alberto Diaz Sanchez (385539)

---

## Descripción del Proyecto
Este repositorio contiene la solución completa para la modelación y consulta analítica de la base de datos NoSQL **BDAutos** en MongoDB.

Se aplican los siguientes patrones de diseño:
- **Embedding:** Catálogo de modelos anidado en los fabricantes (`makers`).
- **Linking:** Referencia por ID de cada automóvil (`cars`) a su respectivo fabricante.

Incluye la implementación de **25 consultas analíticas** construidas con el **Aggregation Framework** de MongoDB.

---

## Estructura del Repositorio

```text
BDAutos-Mongo/
├── scripts/
│   ├── script_BDAutos.js
├── docs/
│   └── Proyecto_1a_Evaluacion_BDAutos.pdf
└── README.md