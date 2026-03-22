"use client";

import Link from "next/link";
import { Zap, Shield, Wifi, Smartphone, ArrowRight, Check, Star, Cpu, Bell, Lock, Gauge, ChevronDown, Play } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Wifi,
    title: "Conexión WiFi Instantánea",
    description: "Configura tus dispositivos en segundos via WiFi o Bluetooth. Sin complicaciones.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Smartphone,
    title: "App Multiplataforma",
    description: "Controla desde iOS, Android o web. Tu hogar siempre a tu alcance.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Seguridad Avanzada",
    description: "Encriptación de grado militar y autenticación de dos factores.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Gauge,
    title: "Respuesta Ultra Rápida",
    description: "Comandos en menos de 100ms. Sin delays perceptibles.",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: Bell,
    title: "Notificaciones Smart",
    description: "Recibe alertas inteligentes solo cuando realmente importan.",
    color: "from-yellow-500 to-amber-500",
  },
  {
    icon: Cpu,
    title: "Procesamiento Local",
    description: "Automatizaciones rápidas sin depender de la nube.",
    color: "from-indigo-500 to-violet-500",
  },
];

const steps = [
  {
    number: "01",
    title: "Crea tu cuenta",
    description: "Registro en 30 segundos. Sin tarjeta de crédito.",
    icon: "🎯",
  },
  {
    number: "02",
    title: "Empareja dispositivos",
    description: "Via Bluetooth o escaneando código QR.",
    icon: "📱",
  },
  {
    number: "03",
    title: "Disfruta el control",
    description: "Automatiza y controla desde cualquier lugar.",
    icon: "✨",
  },
];

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "para siempre",
    description: "Ideal para comenzar",
    features: [
      "3 dispositivos",
      "Control básico",
      "App móvil",
      "Soporte comunidad",
    ],
    popular: false,
    buttonText: "Comenzar gratis",
  },
  {
    name: "Pro",
    price: "9",
    period: "por mes",
    description: "Para hogares conectados",
    features: [
      "Dispositivos ilimitados",
      "Automatizaciones avanzadas",
      "Historial de 30 días",
      "Soporte prioritario",
      "Widgets personalizados",
    ],
    popular: true,
    buttonText: "Comenzar trial",
  },
  {
    name: "Business",
    price: "49",
    period: "por mes",
    description: "Para empresas",
    features: [
      "Todo lo de Pro",
      "Multi-ubicación",
      "Usuarios ilimitados",
      "API completa",
      "SLA 99.9%",
      "Soporte 24/7",
    ],
    popular: false,
    buttonText: "Contactar ventas",
  },
];

const faqs = [
  {
    question: "¿Cómo funciona el emparejamiento?",
    answer: "Abre la app, activa el modo emparejamiento en tu dispositivo y aproxímalo al teléfono. La conexión se hace via Bluetooth de baja energía.",
  },
  {
    question: "¿Qué pasa si pierdo internet?",
    answer: "Tus dispositivos siguen funcionando localmente. Las automatizaciones básicas continúan ejecutándose sin necesidad de conexión a internet.",
  },
  {
    question: "¿Puedo compartir acceso con mi familia?",
    answer: "Sí, con el plan Pro puedes invitar hasta 5 miembros adicionales con permisos configurables.",
  },
  {
    question: "¿Es seguro?",
    answer: "Implementamos encriptación AES-256, autenticación de dos factores y auditorías de seguridad mensuales.",
  },
];

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-background">

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-r from-indigo-500/20 via-purple-500/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-l from-purple-500/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-secondary/80 backdrop-blur-sm border border-border rounded-full text-sm text-muted-foreground mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
             Sistema operativo · v2.0 disponible
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
              El hogar inteligente{" "}
              <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                simplified
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Controla luces, climatización, seguridad y más desde una sola app. 
              Sin suscripciones complejas, sin configuraciones interminables.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
              >
                Empezar gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary/80 backdrop-blur-sm border border-border text-foreground rounded-xl font-semibold text-lg hover:bg-secondary transition-all"
              >
                <Play className="w-5 h-5" />
                Ver cómo funciona
              </Link>
            </div>

            <div className="mt-12 inline-flex items-center gap-6 px-6 py-3 bg-card/50 backdrop-blur-sm border border-border rounded-full">
              <div className="flex -space-x-2">
                {["👨‍💻", "👩‍💻", "👨‍🔬", "👩‍🔬", "🧑‍💻"].map((emoji, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-sm">
                    {emoji}
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">+5,000</span> hogares ya conectados
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <a href="#features" className="text-muted-foreground hover:text-foreground animate-bounce">
            <ChevronDown className="w-6 h-6" />
          </a>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10K+", label: "Dispositivos activos" },
              { value: "99.9%", label: "Disponibilidad" },
              { value: "<100ms", label: "Latencia media" },
              { value: "4.9★", label: "Valoración app" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Características</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Todo lo que necesitas
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Una plataforma completa para gestionar todos tus dispositivos IoT
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-card border border-border rounded-2xl p-6 hover:border-border/80 hover:shadow-xl hover:shadow-black/5 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-5 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className={`absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Guía rápida</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Empieza en minutos
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Tres simples pasos para transformar tu hogar
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="w-20 h-20 mx-auto bg-card border border-border rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg">
                  {step.icon}
                </div>
                <div className="text-5xl font-bold text-primary/10 mb-2">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 right-0 w-1/2 border-t border-dashed border-border transform translate-x-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30" />
            <div className="relative text-center max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                ¿Listo para empezar?
              </h2>
              <p className="mt-4 text-lg text-white/80">
                Únete a miles de hogares que ya disfrutan de un hogar inteligente
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 mt-8 px-8 py-4 bg-white text-primary rounded-xl font-semibold text-lg hover:bg-white/90 shadow-xl transition-all hover:-translate-y-0.5"
              >
                Crear cuenta gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <p className="mt-4 text-sm text-white/60">
                Sin tarjeta de crédito · Configuración en 2 minutos
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">Precios</span>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Simple y transparente
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Elige el plan perfecto para ti
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-card border rounded-2xl p-6 lg:p-8 ${
                  plan.popular
                    ? "border-primary shadow-xl shadow-primary/10 ring-2 ring-primary/20"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                    Más popular
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/register"
                  className={`block w-full text-center px-6 py-3 rounded-xl font-semibold transition-all ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                  }`}
                >
                  {plan.buttonText}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary font-medium text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-foreground">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4"
                >
                  <span className="font-medium text-foreground">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      openFaq === index ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">chIoT</span>
            </div>

            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacidad
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Términos
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contacto
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Docs
              </Link>
            </div>

            <div className="text-sm text-muted-foreground">
              © 2026 chIoT. Todos los derechos reservados.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
