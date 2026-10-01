// ==========================================
// PROYECTO: BDAutos - MongoDB
// EQUIPO: Edgar Alejandro Gutierrez Carrillo #385655, Emilio Gallardo Medrano #385530, Carlos Alberto Diaz Sanchez #385539
// ==========================================

// ==========================================
// CREACIÓN DE COLECCIONES
// ==========================================

// Colección: makers (Embedding)
db.makers.insertMany([
  {
    _id: 1,
    name: "Volkswagen",
    fullName: "Volkswagen AG",
    country: "Germany",
    continent: "Europe",
    models: [{ name: "Jetta" }, { name: "Golf" }]
  },
  {
    _id: 2,
    name: "Toyota",
    fullName: "Toyota Motor Corporation",
    country: "Japan",
    continent: "Asia",
    models: [{ name: "Corolla" }, { name: "Prius" }]
  },
  {
    _id: 3,
    name: "Ford",
    fullName: "Ford Motor Company",
    country: "USA",
    continent: "America",
    models: [{ name: "Mustang" }, { name: "F-150" }]
  },
  {
    _id: 4,
    name: "Honda",
    fullName: "Honda Motor Co.",
    country: "Japan",
    continent: "Asia",
    models: [{ name: "Civic" }, { name: "Accord" }]
  },
  {
    _id: 5,
    name: "Nissan",
    fullName: "Nissan Motor Co.",
    country: "Japan",
    continent: "Asia",
    models: [{ name: "Sentra" }, { name: "GTR" }, { name: "Altima" }]
  },
  {
    _id: 6,
    name: "Audi",
    fullName: "Audi AG",
    country: "Germany",
    continent: "Europe",
    models: [{ name: "A4" }]
  }
]);

// Colección: cars (Linking)
db.cars.insertMany([
  { _id: 101, makerId: 1, model_name: "Jetta", description: "Jetta 2.0", year: 2024, cylinders: 4, hp: 150, weight_lb: 3000, accel_0_60_s: 8.5, mpg: 36 },
  { _id: 102, makerId: 1, model_name: "Golf", description: "Golf R 2.0t", year: 2024, cylinders: 4, hp: 315, weight_lb: 3300, accel_0_60_s: 4.5, mpg: 28 },
  { _id: 103, makerId: 2, model_name: "Prius", description: "Prius Hybrid", year: 2024, cylinders: 4, hp: 120, weight_lb: 2900, accel_0_60_s: 9.8, mpg: 55 },
  { _id: 104, makerId: 3, model_name: "Mustang", description: "Mustang GT", year: 2023, cylinders: 8, hp: 450, weight_lb: 3800, accel_0_60_s: 4.2, mpg: 19 },
  { _id: 105, makerId: 3, model_name: "F-150", description: "F-150 Raptor", year: 2022, cylinders: 8, hp: 400, weight_lb: 5000, accel_0_60_s: 5.5, mpg: 15 },
  { _id: 106, makerId: 4, model_name: "Civic", description: "Civic Si 1.5t", year: 2023, cylinders: 4, hp: 200, weight_lb: 2900, accel_0_60_s: 6.8, mpg: 38 },
  { _id: 107, makerId: 4, model_name: "Accord", description: "Accord V6", year: 2018, cylinders: 6, hp: 278, weight_lb: 3400, accel_0_60_s: 5.8, mpg: 25 },
  { _id: 108, makerId: 5, model_name: "GTR", description: "GTR 3.8t", year: 2024, cylinders: 6, hp: 565, weight_lb: 3900, accel_0_60_s: 2.9, mpg: 16 }
]);

// ==========================================
// CONSULTAS DEL PROYECTO
// ==========================================

// Consulta 1. Obtener los autos de modelo 2024 en adelante con rendimiento de al menos 35 mpg. Mostrar sólo la descripción, el año y el rendimiento, ordenados de mayor a menor rendimiento.
db.cars.find(
  { year: { $gte: 2024 }, mpg: { $gte: 35 } },
  { description: 1, year: 1, mpg: 1, _id: 0 }
).sort({ mpg: -1 })

//Consulta 2. Listar los autos de fabricantes europeos con motor de 4 cilindros y al menos 250 hp, mostrando descripción, país y potencia, ordenados por potencia descendente. 
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $match: { "maker.continent": "Europe", cylinders: 4, hp: { $gte: 250 } } },
  { $project: { _id: 0, description: 1, country: "$maker.country", hp: 1 } },
  { $sort: { hp: -1 } }
])

//Consulta 3. Contar cuántos autos de fabricantes japoneses tienen motor turbo, es decir, cuya descripción termina con la cilindrada seguida de "t" (por ejemplo "1.5t").
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $match: { "maker.country": "Japan", description: /t$/i } },
  { $count: "autos_turbo_japoneses" }
])

//Consulta 4. Encontrar los autos que cumplan cualquiera de estas condiciones: (a) pesan menos de 3000 lb y aceleran de 0 a 60 mph en menos de 9 s, o (b) tienen 8 o más cilindros y rinden al menos 19 mpg.
db.cars.find({
  $or: [
    { weight_lb: { $lt: 3000 }, accel_0_60_s: { $lt: 9 } },
    { cylinders: { $gte: 8 }, mpg: { $gte: 19 } }
  ]
})

//Consulta 5. Obtener los fabricantes que comercializan más de una marca o línea de modelo, mostrando nombre, país y modelos.
db.makers.find(
  { "models.1": { $exists: true } },
  { _id: 0, name: 1, country: 1, models: 1 }
)

//Consulta 6. Encontrar los autos cuya marca (model.name) es distinta del nombre de su grupo fabricante (maker.name). Mostrar descripción, marca y fabricante.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $match: { $expr: { $ne: ["$model_name", "$maker.name"] } } },
  { $project: { _id: 0, description: 1, marca: "$model_name", fabricante: "$maker.name" } }
])

//Consulta 7. Calcular por país el número de autos, el rendimiento promedio y la potencia promedio (redondeados a 1 decimal), ordenado por número de autos.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $group: {
      _id: "$maker.country",
      numAutos: { $sum: 1 },
      avgMpg: { $avg: "$mpg" },
      avgHp: { $avg: "$hp" }
  }},
  { $project: { numAutos: 1, avgMpg: { $round: ["$avgMpg", 1] }, avgHp: { $round: ["$avgHp", 1] } } },
  { $sort: { numAutos: -1 } }
])

//Consulta  8. Calcular para cada grupo fabricante el número de autos, el número de marcas distintas con autos registrados y la potencia promedio (redondeada a 1 decimal), ordenado por número de autos.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $group: {
      _id: "$maker.name",
      numAutos: { $sum: 1 },
      marcasDistintas: { $addToSet: "$model_name" },
      avgHp: { $avg: "$hp" }
  }},
  { $project: { numAutos: 1, numMarcasDistintas: { $size: "$marcasDistintas" }, avgHp: { $round: ["$avgHp", 1] } } },
  { $sort: { numAutos: -1 } }
])

//Consulta 9. Contar cuántos modelos (marcas) hay por continente 
db.makers.aggregate([
	{ $unwind: "$models" },
	{
	$group: {
		_id: "$continent",
		total_modelos: { $sum: 1}
		}
	},
	{
	$project:{
		_id:0,
		continente: "$_id",
		total_modelos: 1
		}
	}
]);

//Consulta 10. Clasificar los autos en rangos de rendimiento [0,20), [20,25), [25,30), [30,35), [35,40) y 40 o más, contando cuántos hay en cada rango y su peso promedio.
db.cars.aggregate([
{
	$bucket: {
		groupBy: "$mpg",
		boundaries: [0, 20, 25, 30, 35, 40],
		default: "40 o mas",
		output: {
			total_autos: { $sum: 1},
			peso_promedio: {$avg: "$weight_lb"}
		}
	}
},
{
	$project: {
		_id: 0,
		rango_mpg: {
			$switch: {
				branches: [
					{case: { $eq: ["$_id", 0]}, then: "[0,20)"},
					{case: {$eq: ["$_id", 20]}, then: "[20,25)"},
					{case: {$eq: ["$_id",25]}, then: "[25,30)"},
					{case: {$eq: ["$_id",30]}, then: "[30,35)"},
					{case:{$eq: ["$_id",35]}, then: "[35,40)"}
				],
				default: "40 o mas"
			}
		},
		total_autos: 1,
		peso_promedio: { $round: ["$peso_promedio", 1]}
		}
	}
]);

//Consulta 11. Obtener los 5 fabricantes con mayor rendimiento promedio, considerando solo aquellos con al menos 8 autos registrados.
db.cars.aggregate([
	{
	$group: {
		_id: "$makerId",
		total_autos: { $sum: 1},
		rendimiento_promedio: {$avg: "$mpg"}
	}
},
{
	$match: {
		total_autos: {$gte: 8}
	}
},
{
	$lookup: {
		from: "makers",
		localField: "_id",
		foreignField: "_id",
		as: "maker"
	}
},
{ $unwind: "$maker"},
{
	$project: {
		_id: 0,
		fabricante: "$maker.name",
		total_autos: 1,
		rendimiento_promedio: {$round: ["$rendimiento_promedio",2]}
	}
},
{$sort: {rendimiento_promedio: -1}},
{$limit: 5}
]);

//Consulta 12. Clasificar cada auto como "Alta" (mpg ≥ 30), "Media" (20 ≤ mpg < 30) o "Baja" (mpg < 20) y contar cuántos autos hay por continente y categoría.
db.cars.aggregate([
	{
	$lookup: {
		from: "makers",
		localField: "makerId",
		foreignField: "_id",
		as: "maker"
	}
},
{ $unwind: "$maker" },
{
	$project:{
		continente: "$maker.continent",
		categoria: {
			$switch: {
				branches: [
					{case: {$gte: ["$mpg",30]}, then: "Alta"},
					{case: {$gte: ["$mpg", 20]}, then: "Media"}
				],
				default: "Baja"
			}
		}
	}
},
{
	$group: {
		_id: {
			continente: "$continente",
			categoria: "$categoria"
		},
		total_autos: { $sum: 1 }
	}
},
{
	$project: {
		_id: 0 ,
		continente: "$_id.continente",
		categoria: "$_id.categoria",
		total_autos: 1
	}
},
{ $sort : {continente: 1, categoria: 1}}
]);

//Consulta 13. Desde la colección makers, obtener cuántos autos tiene registrados cada fabricante (incluidos los que tienen cero)
db.makers.aggregate([
{
	$lookup: {
		from: "cars",
		localField: "_id",
		foreignField: "makerId",
		as: "autos"
	}
},
{
	$project: {
		_id: 0,
		fabricante: "$name",
		pais: "$country",
		total_autos: {$size: "$autos" }
	}
},
{ $sort: { total_autos: -1}}

]);

//Consulta 14. Encontrar los modelos del catálogo que no tienen ningún auto registrado
db.makers.aggregate([
	{ $unwind: "$models"},
{
	$lookup: {
		from: "cars",
		localField: "models.name",
		foreignField: "model_name",
		as: "autos_registrados"
	}
},
{
	$match: {
		autos_registrados: {$size: 0}
	}
},
{
	$project: {
		_id: 0,
		fabricante: "$name",
		pais: "$country",
		modelo_sin_registro: "$models.name"
	}
},
{ $sort: { fabricante: 1, modelo_sin_registro: 1}}
]);

//Consulta 15. Para los 5 autos más potentes, obtener su descripción, potencia y el nombre completo (fullName) de su fabricante
db.cars.aggregate([
{
	$sort: {
		hp: -1
	}
},
{
	$limit: 5
},
{
	$lookup: {
		from: "makers",
		localField: "makerId",
		foreignField: "_id",
		as: "maker"
	}
},
{
	$unwind: "$maker"
},
{
	$project: {
		_id: 0,
		descripcion: "$description",
		potencia: "$hp",
		fabricante: "$maker.fullName"
	}
}
]);

//Consulta 16. Obtener, para cada continente, los 3 autos con mayor rendimiento (descripción y mpg).
db.cars.aggregate([
{
	$lookup: {
		from: "makers",
		localField: "makerId",
		foreignField: "_id",
		as: "maker"
	}
},
{
	$unwind: "$maker"
},
{
	$setWindowFields: {
		partitionBy: "$maker.continent",
		sortBy: {mpg: -1},
		output: {
			posicion: {
				$documentNumber: {}
			}
		}
	}
},
{
	$match: {
		posicion: { $lte: 3}
	}
},
{
	$project: {
		_id: 0,
		continente: "$maker.continent",
		descripcion: "$description",
		mpg: 1
	}
},
{
	$sort: { continente: 1, mpg: 1}
}
]);

//Consulta 17. Para cada fabricante con más de un modelo, determinar cuál de sus modelos tiene más autos registrados.
db.makers.aggregate([
{ $match: {"models.1": { $exists: true}}},
{
	$lookup: {
		from: "cars",
		localField: "_id",
		foreignField: "makerId",
		as: "autos"
	}
},
{ $unwind: "$autos"},
{
	$group: {
		_id: {maker: "$name", modelo: "$autos.model_name"},
		count: { $sum: 1}}
},
{ $sort: {count: -1}
},
{
	$group: {
		_id: "$_id.maker",
		modeloTop: {$first: "$_id.modelo"},
		numAutos: {$first: "$count"}
	}}
]);

//Consulta 18. Calcular el porcentaje que representa cada continente sobre el total de autos, con 2 decimales.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $group: { _id: "$maker.continent", total_autos: { $sum: 1 } } },
  {
    $group: {
      _id: null,
      continentes: { $push: { continente: "$_id", total_autos: "$total_autos" } },
      gran_total: { $sum: "$total_autos" }
    }
  },
  { $unwind: "$continentes" },
  {
    $project: {
      _id: 0,
      continente: "$continentes.continente",
      total_autos: "$continentes.total_autos",
      porcentaje: {
        $round: [
          { $multiply: [{ $divide: ["$continentes.total_autos", "$gran_total"] }, 100] },
          2
        ]
      }
    }
  },
  { $sort: { porcentaje: -1 } }
])
//Consulta 19. Listar los 5 autos que más superan el rendimiento promedio de los autos con su mismo número de cilindros, mostrando ese promedio y la diferencia.
db.cars.aggregate([
  {
    $setWindowFields: {
      partitionBy: "$cylinders",
      output: {
        promedio_cilindros: { $avg: "$mpg" }
      }
    }
  },
  {
    $project: {
      _id: 0,
      descripcion: "$description",
      cilindros: "$cylinders",
      mpg: 1,
      promedio_cilindros: { $round: ["$promedio_cilindros", 2] },
      diferencia: {
        $round: [{ $subtract: ["$mpg", "$promedio_cilindros"] }, 2]
      }
    }
  },
  { $sort: { diferencia: -1 } },
  { $limit: 5 }
])

//Consulta 20. Calcular, por continente, el número de autos, cuántos tienen 8 o más cilindros y el porcentaje que representan (1 decimal).
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  {
    $group: {
      _id: "$maker.continent",
      total_autos: { $sum: 1 },
      autos_8_o_mas_cilindros: {
        $sum: { $cond: [{ $gte: ["$cylinders", 8] }, 1, 0] }
      }
    }
  },
  {
    $project: {
      _id: 0,
      continente: "$_id",
      total_autos: 1,
      autos_8_o_mas_cilindros: 1,
      porcentaje: {
        $round: [
          { $multiply: [{ $divide: ["$autos_8_o_mas_cilindros", "$total_autos"] }, 100] },
          1
        ]
      }
    }
  }
])

//Consulta 21. Calcular la potencia por cada 1000 lb de peso y mostrar los 10 autos con mayor valor, junto con su país.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  {
    $project: {
      _id: 0,
      descripcion: "$description",
      pais: "$maker.country",
      potencia_por_1000lb: {
        $round: [
          { $multiply: [{ $divide: ["$hp", "$weight_lb"] }, 1000] },
          2
        ]
      }
    }
  },
  { $sort: { potencia_por_1000lb: -1 } },
  { $limit: 10 }
])

//Consulta 22. Para cada fabricante, mostrar solo los modelos cuyo nombre es distinto al nombre del fabricante, descartando a los fabricantes que no tengan ninguno.
db.makers.aggregate([
  {
    $project: {
      _id: 0,
      fabricante: "$name",
      modelos_distintos: {
        $filter: {
          input: "$models.name",
          as: "model_name",
          cond: { $ne: ["$$model_name", "$name"] }
        }
      }
    }
  },
  {
    $match: {
      $expr: { $gt: [{ $size: "$modelos_distintos" }, 0] }
    }
  }
])

//Consulta 23. En una sola consulta, obtener: (a) el número de autos por continente, (b) el número de autos por cilindros y (c) las estadísticas globales de mpg (mínimo, máximo y promedio).
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  {
    $facet: {
      autos_por_continente: [
        { $group: { _id: "$maker.continent", total_autos: { $sum: 1 } } },
        { $project: { _id: 0, continente: "$_id", total_autos: 1 } }
      ],
      autos_por_cilindros: [
        { $group: { _id: "$cylinders", total_autos: { $sum: 1 } } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, cilindros: "$_id", total_autos: 1 } }
      ],
      estadisticas_globales_mpg: [
        {
          $group: {
            _id: null,
            min_mpg: { $min: "$mpg" },
            max_mpg: { $max: "$mpg" },
            avg_mpg: { $round: [{ $avg: "$mpg" }, 2] }
          }
        },
        { $project: { _id: 0 } }
      ]
    }
  }
])

//Consulta 24. Asignar a cada auto alemán su posición por potencia dentro de su país y mostrar los 5 primeros.
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $match: { "maker.country": "Germany" } },
  {
    $setWindowFields: {
      partitionBy: "$maker.country",
      sortBy: { hp: -1 },
      output: {
        posicion_potencia: { $documentNumber: {} }
      }
    }
  },
  { $match: { posicion_potencia: { $lte: 5 } } },
  {
    $project: {
      _id: 0,
      descripcion: "$description",
      pais: "$maker.country",
      potencia: "$hp",
      posicion_potencia: 1
    }
  },
  { $sort: { posicion_potencia: 1 } }
])

//Consulta 25. Obtener para cada fabricante europeo su auto más eficiente
db.cars.aggregate([
  { $lookup: { from: "makers", localField: "makerId", foreignField: "_id", as: "maker" } },
  { $unwind: "$maker" },
  { $match: { "maker.continent": "Europe" } },
  { $sort: { mpg: -1 } },
  {
    $group: {
      _id: "$maker.name",
      auto_mas_eficiente: { $first: "$description" },
      mpg: { $first: "$mpg" }
    }
  },
  {
    $project: {
      _id: 0,
      fabricante: "$_id",
      auto_mas_eficiente: 1,
      mpg: 1
    }
  }
])
