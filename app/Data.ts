export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
  imagen: string;
  descripcion: string;
  imagendescripcion: string[];
}

export interface ProductosPorCategoria {
  juguetes: Producto[];
  accesorios: Producto[];
  alimentos: Producto[];
}

export const todosLosProductos: ProductosPorCategoria = {
  juguetes: [
    {
      id: 1,
      nombre: "Pelota para perro",
      precio: 5000,
      stock: 10,
      imagen: "img/pelotaperro.jpg",
      imagendescripcion: [
        "img/pelotaperro.jpg",
        "img/pelota2.webp",
        "img/pelota3.jpg",
      ],
      descripcion:
        "Pelota resistente ideal para juegos de lanzar y buscar. Flota en el agua.",
    },
    {
      id: 2,
      nombre: "Ratón de juguete para gato",
      precio: 3000,
      stock: 8,
      imagen: "img/raton.jpeg",
      imagendescripcion: [
        "img/raton.jpeg",
        "img/ratomcitos.webp",
        "img/ratonces-piramide.webp",
      ],
      descripcion:
        "Juguete suave con catnip para estimular el instinto de caza de tu gato.",
    },
    {
      id: 3,
      nombre: "Cuerda para morder",
      precio: 7000,
      stock: 5,
      imagen: "img/morder.jpg",
      imagendescripcion: [
        "img/morder.jpg",
        "img/cuerda2.avif",
        "img/cuerda3.webp",
      ],
      descripcion:
        "Cuerda de algodón duradera para perros, ayuda a limpiar los dientes.",
    },
    {
      id: 4,
      nombre: "Juguete interactivo",
      precio: 12000,
      stock: 26,
      imagen: "img/juguetepuzzleparaperros.webp",
      imagendescripcion: [
        "img/juguetepuzzleparaperros.webp",
        "img/interactivo.jpg",
        "img/interactivo2.webp",
      ],
      descripcion:
        "Juguete dispensador de premios que desafía la mente de tu mascota.",
    },
    {
      id: 5,
      nombre: "Pelota con sonido",
      precio: 8000,
      stock: 17,
      imagen: "img/pelota.jpg",
      imagendescripcion: [
        "img/pelota.jpg",
        "img/sonido.webp",
        "img/sonido2.webp",
      ],
      descripcion:
        "Pelota que emite sonidos divertidos al ser mordida, ideal para mantener a tu perro entretenido.",
    },
  ],
  accesorios: [
    {
      id: 6,
      nombre: "Collar para perro",
      precio: 10000,
      stock: 10,
      imagen: "img/collar.webp",
      imagendescripcion: [
        "img/collar.webp",
        "img/collar2.jpg",
        "img/collar3.jpg",
      ],
      descripcion:
        "Collar ajustable y resistente para perros de tamaño mediano a grande.",
    },
    {
      id: 7,
      nombre: "Correa ajustable",
      precio: 12000,
      stock: 8,
      imagen: "img/accesorio.jpg",
      imagendescripcion: [
        "img/accesorio.jpg",
        "img/correa1.avif",
        "img/correa2.webp",
      ],
      descripcion:
        "Correa de nylon con longitud ajustable, ideal para paseos diarios.",
    },
    {
      id: 8,
      nombre: "Arnés para perro",
      precio: 15000,
      stock: 5,
      imagen: "img/collarcorrea.jpg",
      imagendescripcion: [
        "img/collarcorrea.jpg",
        "img/arnes1.webp",
        "img/arnes2.jpg",
      ],
      descripcion:
        "Arnés cómodo y seguro que distribuye la presión uniformemente.",
    },
    {
      id: 9,
      nombre: "Cama para gato",
      precio: 20000,
      stock: 6,
      imagen: "img/cama.webp",
      imagendescripcion: [
        "img/cama.webp",
        "img/camagato2.jpg",
        "img/camagato3.webp",
      ],
      descripcion:
        "Cama suave y acogedora para gatos, con bordes elevados para mayor confort.",
    },
  ],
  alimentos: [
    {
      id: 10,
      nombre: "Comida seca para perros",
      precio: 25000,
      stock: 10,
      imagen: "img/master.jpeg",
      imagendescripcion: [
        "img/master.jpeg",
        "img/comidaperro2.png",
        "img/comidaperro3.png",
      ],
      descripcion:
        "Alimento completo y balanceado para perros adultos, con proteínas de alta calidad.",
    },
    {
      id: 11,
      nombre: "Comida húmeda para gatos",
      precio: 15000,
      stock: 18,
      imagen: "img/lata.jpg",
      imagendescripcion: [
        "img/lata.jpg",
        "img/comidahumeda1.avif",
        "img/comidahumeda2.jpg",
      ],
      descripcion:
        "Paté delicioso y nutritivo para gatos, ideal para complementar su dieta.",
    },
    {
      id: 12,
      nombre: "Snacks para perros",
      precio: 8000,
      stock: 15,
      imagen: "img/snackperro.png",
      imagendescripcion: [
        "img/snackperro.png",
        "img/snackperro2.jpg",
        "img/snackperro3.jpg",
      ],
      descripcion:
        "Premios masticables para perros, ayudan a la higiene dental.",
    },
    {
      id: 13,
      nombre: "Snacks para gatos",
      precio: 7000,
      stock: 16,
      imagen: "img/sanac.jpg",
      imagendescripcion: [
        "img/sanac.jpg",
        "img/snackgato2.jpg",
        "img/snackgato3.jpg",
      ],
      descripcion:
        "Bocadillos crujientes para gatos, con vitaminas y minerales.",
    },
    {
      id: 14,
      nombre: "Alimento para aves",
      precio: 12000,
      stock: 7,
      imagen: "img/aveees.png",
      imagendescripcion: ["img/aveees.png", "img/ave2.png", "img/ave3.png"],
      descripcion:
        "Mezcla de semillas y granos enriquecida para aves de jaula.",
    },
  ],
};

export const comunasPorRegion: Record<string, string[]> = {
  metropolitana: [
    "Santiago",
    "Maipú",
    "Puente Alto",
    "Las Condes",
    "La Florida",
  ],
  valparaiso: [
    "Valparaíso",
    "Viña del Mar",
    "Quilpué",
    "Villa Alemana",
    "San Antonio",
  ],
  biobio: ["Concepción", "Talcahuano", "Chillán", "Los Ángeles", "Coronel"],
};

// ========= OFERTAS POR PRODUCTO =========
export type OfertaProducto = {
  productId: number;
  porcentaje: number;
  hasta?: string;
};

export const OFERTAS_PRODUCTO: OfertaProducto[] = [
  // Ejemplos:
  { productId: 1, porcentaje: 15, hasta: "Fin de mes" },
  { productId: 5, porcentaje: 20 },
  { productId: 14, porcentaje: 35 },
  { productId: 11, porcentaje: 40 },
  { productId: 1, porcentaje: 10 },
  { productId: 8, porcentaje: 25, hasta: "Cyber Week" },
];

export const getOfertaFor = (id: number): number => {
  const o = OFERTAS_PRODUCTO.find((x) => x.productId === id);
  return o ? o.porcentaje : 0;
};
