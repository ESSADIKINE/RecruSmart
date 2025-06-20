import { useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/common/Navbar';
import Hero from '@/components/common/Hero';
import Footer from '@/components/common/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import JobCard from '@/components/dashboard/JobCard';
import { ArrowRight, CheckCircle2, Globe, Briefcase, Building2 } from 'lucide-react';

// Données d'exemple pour les emplois en vedette
const featuredJobs = [
  {
    id: 1,
    title: "Développeur React Senior",
    company: "TechCorp Inc.",
    companyLogo: "https://i.pravatar.cc/150?img=1",
    location: "San Francisco, CA (Télétravail)",
    salary: "120K€ - 150K€",
    type: "Temps plein",
    status: "En vedette",
    description: "Nous recherchons un Développeur React Senior pour rejoindre notre équipe dynamique. Vous travaillerez sur des applications web de pointe utilisant les dernières technologies.",
    skills: ["React", "TypeScript", "Node.js", "Redux"],
    postedDate: "Il y a 2 jours",
    applicants: 42
  },
  {
    id: 2,
    title: "Designer UX/UI",
    company: "DesignHub",
    companyLogo: "https://i.pravatar.cc/150?img=2",
    location: "New York, NY",
    salary: "90K€ - 110K€",
    type: "Temps plein",
    status: "Nouveau",
    description: "Rejoignez notre équipe créative pour concevoir des interfaces belles et intuitives pour nos produits phares. Travaillez en étroite collaboration avec les chefs de produit et les développeurs.",
    skills: ["Figma", "Adobe XD", "Design UI", "Prototypage"],
    postedDate: "Il y a 3 jours",
    applicants: 28
  },
  {
    id: 3,
    title: "Data Scientist",
    company: "DataMinds",
    companyLogo: "https://i.pravatar.cc/150?img=3",
    location: "Télétravail",
    salary: "100K€ - 130K€",
    type: "Temps plein",
    status: "Urgent",
    description: "Nous recherchons un Data Scientist expérimenté pour travailler sur des problèmes complexes en apprentissage automatique et IA. Rejoignez une équipe d'esprits brillants.",
    skills: ["Python", "Machine Learning", "SQL", "Visualisation de données"],
    postedDate: "Il y a 1 semaine",
    applicants: 64
  }
];

// Données des entreprises
const companies = [
  { name: "TechCorp", logo: "https://i.pravatar.cc/150?img=10" },
  { name: "DesignHub", logo: "https://i.pravatar.cc/150?img=20" },
  { name: "DataMinds", logo: "https://i.pravatar.cc/150?img=30" },
  { name: "CloudNine", logo: "https://i.pravatar.cc/150?img=40" },
  { name: "FinEdge", logo: "https://i.pravatar.cc/150?img=50" },
  { name: "GreenTech", logo: "https://i.pravatar.cc/150?img=60" },
];

export default function Home() {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Section Hero */}
      <Hero />
      
      {/* Section Emplois en Vedette */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <h2 className="text-3xl font-bold">Emplois en Vedette</h2>
              <p className="text-muted-foreground mt-2">Explorez les meilleures opportunités des entreprises leaders</p>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeIn}
            >
              <Button variant="outline" className="hidden sm:flex items-center">
                Voir Tous les Emplois
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { 
                      duration: 0.5,
                      delay: index * 0.1
                    } 
                  }
                }}
              >
                <JobCard job={job} featured={job.status === 'En vedette'} />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <Button variant="outline" className="sm:hidden">
              Voir Tous les Emplois
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Section Comment Ça Marche */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Comment Fonctionne RecruSmart</h2>
            <p className="text-muted-foreground">
              Notre plateforme simplifie le processus de recrutement pour les employeurs et les chercheurs d'emploi,
              facilitant la recherche du match parfait.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="h-10 w-10 text-primary" />,
                title: "Créez Votre Profil",
                description: "Construisez votre profil professionnel en mettant en avant vos compétences, expérience et objectifs de carrière."
              },
              {
                icon: <Briefcase className="h-10 w-10 text-primary" />,
                title: "Trouvez des Emplois Pertinents",
                description: "Notre algorithme d'appariement IA trouve les meilleures opportunités basées sur votre profil et vos préférences."
              },
              {
                icon: <Building2 className="h-10 w-10 text-primary" />,
                title: "Connectez-vous avec les Employeurs",
                description: "Postulez aux emplois en un seul clic et communiquez directement avec les responsables du recrutement."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0, 
                    transition: { 
                      duration: 0.5,
                      delay: index * 0.2
                    } 
                  }
                }}
              >
                <Card className="h-full border-none shadow-lg bg-card hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="rounded-full p-4 bg-primary/10 mb-6">{item.icon}</div>
                    <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section Entreprises Leaders */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center max-w-2xl mx-auto mb-10"
          >
            <h2 className="text-3xl font-bold mb-4">Entreprises Leaders qui Recrutent</h2>
            <p className="text-muted-foreground">
              Rejoignez les leaders de l'industrie et les startups en croissance rapide utilisant RecruSmart
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {companies.map((company, index) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { 
                    opacity: 1, 
                    scale: 1, 
                    transition: { 
                      duration: 0.3,
                      delay: index * 0.1
                    } 
                  }
                }}
              >
                <Card className="h-full hover:shadow-md transition-shadow duration-300 flex items-center justify-center p-6">
                  <img
                    src={company.logo}
                    alt={company.name}
                    className="h-12 w-12 rounded-full object-cover mx-auto"
                  />
                  <p className="mt-2 text-center font-medium">{company.name}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Section CTA */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Prêt à Transformer Votre Processus de Recrutement ?</h2>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Rejoignez des milliers d'entreprises et de candidats qui établissent de meilleures connexions avec RecruSmart.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button size="lg" variant="secondary" className="text-primary">
                Publier un Emploi Maintenant
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:text-primary hover:bg-primary-foreground">
                En Savoir Plus
              </Button>
            </div>
            
            <div className="mt-10 flex flex-col md:flex-row justify-center gap-8">
              {[
                "Processus de recrutement 93% plus rapide",
                "Réduction des coûts de 75%",
                "86% de meilleur appariement de candidats"
              ].map((stat, index) => (
                <div key={index} className="flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-green-400" />
                  <span className="font-medium">{stat}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}