import mongoose from 'mongoose'

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error(
      "❌ Erreur : La variable d'environnement MONGO_URI est manquante."
    )
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as any)
    console.log('✅ MongoDB connecté avec succès !')
  } catch (err) {
    console.error('❌ Erreur de connexion à MongoDB :', err)
    process.exit(1)
  }
}

export default connectDB
