    # Lista de Compras

Un componente de lista de compras desarrollado en JavaScript vanilla que consume la API de DummyJSON para demostrar conceptos fundamentales de JavaScript sin frameworks.

## Instrucciones de Ejecución

1. Clonar o descargar el repositorio
2. Abrir el archivo index.html en un navegador web
3. Escribir en el campo de búsqueda (mínimo 2 caracteres)
4. Usar el botón ✕ para limpiar la búsqueda cuando sea necesario
5. Marcar o desmarcar productos con los checkboxes
6. Gestionar la lista de productos seleccionados
7. Ver estadísticas actualizadas en tiempo real

## Decisiones Técnicas

- Clase ES6 para encapsulación y reutilización
- ID único por instancia 
- Gestión de estado
- Manejo de errores en llamada al API
- Debounce de 300ms en búsqueda
- Lazy loading de imágenes
- Persistencia de datos en localStorage
- Atributos role y aria-label para optimizar accesibilidad. 

## Flujo de Funcionamiento

Se inicializa el documento con la detección de componentes que coincidan con el selector indicado. Posteriormente se comienza a generar el template con los elementos HTML para poder hacer la asignación de eventos. 

Una vez generado el UI, el usuario interactúa con el campo de búsqueda ingresando palabras clave para que entonces se realice la búsqueda evitando llamadas adicionales con un Debounce. Al recibir los datos, estos se renderizan en la lista de resultados para que el usuario pueda seleccionar los elementos. 

Los elementos seleccionados tendrán una lista especial que el usuario pueda modificar posteriormente como un carrito de compras. La lista se va actualizando y guardando en LocalStorage. Los datos sobre el número de productos se van actualizando en tiempo real.


