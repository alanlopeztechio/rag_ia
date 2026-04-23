# RAG AI Chatbot with Convex and OpenAI

Este es un chatbot avanzado de RAG (Retrieval-Augmented Generation) construido con **Next.js**, **Convex**, **OpenAI** y el **Vercel AI SDK**. La aplicación permite al asistente de IA gestionar su propia base de conocimientos de forma autónoma mediante el uso de herramientas (*tools*).

Basado en la guía de [AI SDK Cookbook: RAG Chatbot with Tools](https://ai-sdk.dev/cookbook/guides/rag-chatbot#using-tools).

## 🚀 Características

- **RAG con Búsqueda Vectorial:** Utiliza el motor de búsqueda vectorial nativo de Convex para encontrar información relevante basada en la semántica.
- **Gestión Autónoma de Conocimiento:** El chatbot puede decidir cuándo añadir nueva información a su base de datos o consultar información existente utilizando herramientas (*Function Calling*).
- **Streaming de Respuestas:** Interfaz de chat fluida con respuestas en tiempo real mediante `streamText`.
- **Persistencia en Convex:** Almacenamiento eficiente de embeddings y metadatos en la base de datos de Convex.
- **Generación de Embeddings:** Procesamiento automático de texto en fragmentos (*chunks*) y generación de vectores usando `text-embedding-ada-002` de OpenAI.

## 🛠️ Stack Tecnológico

- **Framework:** Next.js 15+ (App Router)
- **Base de Datos y Backend:** [Convex](https://www.convex.dev/)
- **AI SDK:** [Vercel AI SDK](https://sdk.vercel.ai/)
- **LLM & Embeddings:** OpenAI (GPT-4o y text-embedding-ada-002)
- **Estilos:** Tailwind CSS

## 🛠️ Herramientas de la IA (Tools)

El asistente tiene acceso a las siguientes herramientas definidas en `app/api/chat/route.ts`:

1.  **`addResource`**: Permite al chatbot guardar nueva información en su base de conocimientos. Si el usuario proporciona datos útiles, la IA los fragmenta y genera embeddings automáticamente.
2.  **`getInformation`**: Realiza una búsqueda semántica en la base de datos vectorial para recuperar contexto relevante antes de responder a una pregunta.

## 📋 Requisitos Previos

- Node.js y pnpm instalados.
- Cuenta en [Convex](https://www.convex.dev/).
- API Key de [OpenAI](https://platform.openai.com/).

## ⚙️ Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone git@github.com-work:alanlopeztechio/rag_ia.git
    cd rag_ia
    ```

2.  **Instalar dependencias:**
    ```bash
    pnpm install
    ```

3.  **Configurar variables de entorno:**
    Crea un archivo `.env.local` y añade tu clave de OpenAI:
    ```env
    OPENAI_API_KEY=tu_api_key_aqui
    ```
    También asegúrate de configurar la clave de OpenAI en el panel de Convex (Settings -> Environment Variables) para que las *Actions* de Convex puedan acceder a ella:
    `OPENAI_API_KEY=tu_api_key_aqui`

4.  **Iniciar Convex:**
    ```bash
    npx convex dev
    ```

5.  **Ejecutar la aplicación:**
    ```bash
    pnpm run dev
    ```

## 📖 Cómo funciona

1.  **Ingesta de datos:** Cuando le dices algo informativo a la IA, esta llama a `addResource`. El backend de Convex (`convex/embeddings.ts`) recibe el texto, lo divide en oraciones, genera los embeddings con OpenAI y los guarda en un `vectorIndex`.
2.  **Consulta:** Al hacer una pregunta, la IA llama a `getInformation`. Convex realiza una búsqueda vectorial (`ctx.vectorSearch`) para encontrar los fragmentos con mayor similitud de coseno (> 0.8).
3.  **Respuesta Aumentada:** La IA recibe los datos recuperados como contexto y genera una respuesta precisa basada únicamente en esa información.

---
Creado por [Alan Lopez](https://github.com/alanlopeztechio).
