// frontend/src/pages/Home.jsx
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  PerspectiveCamera,
  Float,
  Stars,
} from "@react-three/drei";
import * as THREE from "three";
import API from "../services/api";
import ThreeDSphere from "../components/ThreeDSphere";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import AboutImage from "../assets/profile.jpg";

// Subtle Starfield for Dark Mode
const SubtleStarfield = () => {
  const starsRef = useRef();

  useFrame((state) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <group ref={starsRef}>
      <Stars
        radius={100}
        depth={50}
        count={10000}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />
    </group>
  );
};

// Rose Gold Dust Particles for Light Mode
const RoseGoldDust = () => {
  const particlesRef = useRef();
  const particleCount = 3000;

  const particles = React.useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    // Rose gold color variations
    const roseGoldColors = [
      new THREE.Color("#B76E79"), // Rose gold
      new THREE.Color("#C9A882"), // Light gold
      new THREE.Color("#E8B4B8"), // Pink gold
      new THREE.Color("#D4AF37"), // Gold
      new THREE.Color("#F4C2C2"), // Soft pink
    ];

    for (let i = 0; i < particleCount; i++) {
      // Random positions
      positions[i * 3] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 200;

      // Random rose gold color
      const color =
        roseGoldColors[Math.floor(Math.random() * roseGoldColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // Random sizes
      sizes[i] = Math.random() * 0.5 + 0.1;
    }

    return { positions, colors, sizes };
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      particlesRef.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={particles.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={particleCount}
          array={particles.sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.8}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const Home = () => {
  // Hardcoded projects data
  const { userEmail } = useAuth();
  const hardcodedProjects = [
    {
      _id: "1",
      title: "Comparative Risk Assessment of VRUs and AVs",
      short_desc:
        "Research project analyzing the comparative risk assessment of Vulnerable Road Users (VRUs) and Autonomous Vehicles (AVs) across urban intersections using advanced data analytics.",
      long_desc:
        "This project focuses on developing a comprehensive framework for assessing and comparing risks between Vulnerable Road Users (VRUs) such as pedestrians and cyclists, and Autonomous Vehicles (AVs) at urban intersections. The study employs data-driven methodologies to analyze traffic patterns, collision scenarios, and safety metrics to improve urban transportation safety.\n\nKey features include:\n- Risk assessment modeling for VRUs and AVs\n- Urban intersection data analysis\n- Statistical evaluation of safety metrics\n- Predictive modeling for accident prevention\n- Comparative analysis framework\n\nThe research aims to contribute to safer urban mobility solutions and inform policy decisions for smart city development.",
      tech_stack: [
        "Python",
        "Data Analysis",
        "Machine Learning",
        "Statistical Modeling",
        "Research",
      ],
      link: "https://github.com/aaditimenon/Comparative-Risk-Assessment-of-VRUs-and-AVs-Across-Urban-Intersections",
    },
    {
      _id: "2",
      title: "Context-Aware DDoS Detection for 5G V2X Networks",
      short_desc:
        "Intelligent DDoS detection system designed specifically for 5G Vehicle-to-Everything (V2X) networks, leveraging context-aware mechanisms to enhance network security and reliability.",
      long_desc:
        "This project presents a novel context-aware DDoS detection system tailored for 5G Vehicle-to-Everything (V2X) networks. As V2X communication becomes critical for autonomous driving and smart transportation, securing these networks against Distributed Denial of Service (DDoS) attacks is paramount.\n\nThe system incorporates:\n- Real-time traffic analysis and anomaly detection\n- Context-aware filtering mechanisms\n- Machine learning-based threat classification\n- 5G network optimization for V2X communication\n- Automated response and mitigation strategies\n\nThe solution addresses the unique challenges of V2X networks including low latency requirements, high mobility scenarios, and critical safety applications. This research contributes to building more resilient and secure future transportation infrastructure.",
      tech_stack: [
        "Python",
        "Machine Learning",
        "Network Security",
        "5G Networks",
        "V2X Communication",
        "Cybersecurity",
      ],
      link: "https://github.com/aaditimenon/Context-Aware-DDoS-detection-system-for-5G-V2X-networks",
    },
  ];

  const [projects, setProjects] = useState(hardcodedProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Contact & Messages State
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState(null);

  // Replace single message state with array
  const [userMessages, setUserMessages] = useState([]);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // Scroll event listener for scroll-to-top button
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Update theme when changed
    const theme = isDarkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [isDarkMode]);

  // Load user messages from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem("userMessages");
    if (savedMessages) {
      const messages = JSON.parse(savedMessages);
      // Remove messages older than 30 days
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const validMessages = messages.filter(
        (msg) => msg.timestamp > thirtyDaysAgo
      );
      setUserMessages(validMessages);
      localStorage.setItem("userMessages", JSON.stringify(validMessages));
    }
  }, []);

  useEffect(() => {
    // Typewriter animation for contact section
    const greetings = [
      "hello", // English
      "नमस्ते", // Hindi
      "வணக்கம்", //Tamil
      "নমস্কার", //Bangla
      "こんにちは", // Japanese
      "안녕하세요", // Korean
      "你好", // Chinese
      "hola", // Spanish
      "bonjour", // French
      "ciao", // Italian
      "hallo", // German
    ];

    let currentGreetingIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    const typedTextElement = document.getElementById("typedText");
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseBeforeDelete = 1500;
    const pauseBeforeType = 500;

    function typeWriter() {
      if (!typedTextElement) return;

      const currentGreeting = greetings[currentGreetingIndex];

      if (!isDeleting) {
        if (currentCharIndex < currentGreeting.length) {
          typedTextElement.textContent = currentGreeting.substring(
            0,
            currentCharIndex + 1
          );
          currentCharIndex++;
          setTimeout(typeWriter, typingSpeed);
        } else {
          setTimeout(() => {
            isDeleting = true;
            typeWriter();
          }, pauseBeforeDelete);
        }
      } else {
        if (currentCharIndex > 0) {
          typedTextElement.textContent = currentGreeting.substring(
            0,
            currentCharIndex - 1
          );
          currentCharIndex--;
          setTimeout(typeWriter, deletingSpeed);
        } else {
          isDeleting = false;
          currentGreetingIndex = (currentGreetingIndex + 1) % greetings.length;
          setTimeout(typeWriter, pauseBeforeType);
        }
      }
    }

    typeWriter();
  }, []);

  // Fetch messages and handle delete from URL
  useEffect(() => {
    const handleDeleteFromURL = async () => {
      const hash = window.location.hash;
      const deleteMatch = hash.match(/delete=([^/]+)\/([^&]+)/);

      if (deleteMatch) {
        const [, messageId, token] = deleteMatch;
        try {
          await API.delete(`/messages/${messageId}/${token}`);
          alert("Message deleted successfully!");
          window.location.hash = "#contact";
          fetchMessages();
        } catch (err) {
          alert("Failed to delete message. Invalid or expired link.");
        }
      }
    };

    handleDeleteFromURL();
    fetchMessages();
  }, []);

  // Auto-scroll messages effect
  useEffect(() => {
    if (messages.length === 0) return;

    const messagesList = document.querySelector(".messages-list");
    if (!messagesList) return;

    let scrollPosition = 0;
    let scrollInterval;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        scrollPosition += 1;
        messagesList.scrollTop = scrollPosition;

        // Reset to top when reaching bottom
        if (
          scrollPosition >=
          messagesList.scrollHeight - messagesList.clientHeight
        ) {
          scrollPosition = 0;
        }
      }, 30); // Adjust speed (lower = faster)
    };

    const stopAutoScroll = () => {
      clearInterval(scrollInterval);
    };

    // Start auto-scrolling
    startAutoScroll();

    // Pause on hover
    messagesList.addEventListener("mouseenter", stopAutoScroll);
    messagesList.addEventListener("mouseleave", startAutoScroll);

    // Cleanup
    return () => {
      stopAutoScroll();
      messagesList.removeEventListener("mouseenter", stopAutoScroll);
      messagesList.removeEventListener("mouseleave", startAutoScroll);
    };
  }, [messages]);

  // Fetch messages
  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const { data } = await API.get("/messages");
      setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const { data } = await API.post("/messages", contactForm);

      // Add new message to array
      const newUserMessage = {
        messageId: data.messageId,
        deleteToken: data.deleteToken,
        timestamp: Date.now(),
      };

      const updatedMessages = [...userMessages, newUserMessage];
      setUserMessages(updatedMessages);

      // Save to localStorage
      localStorage.setItem("userMessages", JSON.stringify(updatedMessages));

      setSubmitMessage({
        type: "success",
        text: "Message sent successfully! Your message appears below.",
      });
      setContactForm({ name: "", email: "", message: "" });

      // Refresh messages to show new message
      fetchMessages();
    } catch (err) {
      console.error("Failed to send message:", err);
      setSubmitMessage({
        type: "error",
        text: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update handleDeleteMessage to accept messageId and token as parameters
  const handleDeleteMessage = async (messageId, deleteToken) => {
    if (!window.confirm("Are you sure you want to delete your message?"))
      return;

    try {
      await API.delete(`/messages/${messageId}/${deleteToken}`);
      alert("Message deleted successfully!");

      // Remove from userMessages array
      const updatedMessages = userMessages.filter(
        (msg) => msg.messageId !== messageId
      );
      setUserMessages(updatedMessages);
      localStorage.setItem("userMessages", JSON.stringify(updatedMessages));

      // Refresh messages
      fetchMessages();
    } catch (err) {
      alert("Failed to delete message. Please try again.");
    }
  };

  // Helper function to check if a message belongs to user
  const isUserMessage = (message) => {
    return (
      message.email?.trim().toLowerCase() === userEmail?.trim().toLowerCase()
    );
  };

  // Helper function to get delete token for a message
  const getDeleteToken = (messageId) => {
    const userMsg = userMessages.find((msg) => msg.messageId === messageId);
    return userMsg ? userMsg.deleteToken : null;
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="galaxy-portfolio">
      {/* Dynamic Background: Stars for Dark, Rose Gold Dust for Light */}
      <div className="galaxy-background">
        <Canvas
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 5], fov: 75 }}
        >
          <Suspense fallback={null}>
            {isDarkMode ? <SubtleStarfield /> : <RoseGoldDust />}
          </Suspense>
        </Canvas>
      </div>

      {/* Logo */}
      <div className="logo">
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path d="M15 15 L25 20 L15 25 Z" fill="currentColor" />
        </svg>
      </div>

      {/* Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={toggleTheme}
        title="Toggle Theme"
      >
        {isDarkMode ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          className="scroll-to-top"
          onClick={scrollToTop}
          title="Scroll to Top"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      )}

      {/* Sidebar Navigation */}
      <nav className="sidebar">
        <a href="#about" className="nav-link">
          About
        </a>
        <a href="#projects" className="nav-link active">
          Projects
        </a>
        <a href="#achievements" className="nav-link">
          Achievement
        </a>
        <a href="#contact" className="nav-link">
          Contact
        </a>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-header">
            <span className="hero-name">Aaditi Menon</span>
          </div>

          <h1 className="hero-title">
            <span className="title-main">Building</span>
            <span className="title-sub">through code</span>
          </h1>

          <p className="hero-desc">
            Designing and building solutions that matter
          </p>
        </section>

        {/* About Section */}
        <section className="about-section" id="about">
          <h2 className="section-title">About Me</h2>
          <div className="about-content">
            <div className="about-text">
              <p>
                I'm a passionate developer focused on bringing ideas to life
                through creative coding and data science. My work combines
                curiosity for machine learning and practical software
                engineering to build innovative solutions and share knowledge
                with the tech community.
              </p>
              <p>
                Actively contributing to open-source, I enjoy collaborating,
                exploring data, and continually expanding my skillset. Whether
                it's researching urban mobility or developing intelligent
                network solutions, I’m driven by the challenge of solving
                real-world problems and creating something meaningful.
              </p>
            </div>
            <img src={AboutImage} alt="About Me" />
          </div>
        </section>

        {/* Projects Section */}
        <section className="projects-section" id="projects">
          <h2 className="section-title">Featured Projects</h2>
          <div className="projects-grid">
            {projects.map((project, index) => (
              <div
                key={project._id}
                className="project-card"
                onClick={() => handleProjectClick(project)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="card-glow"></div>
                <div className="project-content">
                  <h3 className="project-title">{project.title}</h3>
                  <p className="project-desc">{project.short_desc}</p>
                  <span className="project-link">Explore →</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Achievement Section */}
        <section className="achievements-section" id="achievements">
          <h2 className="section-title">Achievements</h2>
          <div className="achievements-content">
            <div className="achievements-brief">
              <p>
                My open-source journey includes impactful pull requests and
                active community involvement during Hacktoberfest 2025, with
                multiple badges awarded for my participation.
              </p>
            </div>
            <a
              href="https://holopin.io/@aaditimenon"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src="https://holopin.me/aaditimenon"
                alt="An image of @aaditimenon's Holopin badges, which is a link to view their full Holopin profile"
                style={{
                  width: "900px",
                  maxWidth: "100%",
                  borderRadius: "16px",
                  boxShadow: "0 6px 26px rgba(139,92,246,0.15)",
                  marginTop: "1.6rem",
                  marginLeft: "8.5rem",
                  cursor: "pointer",
                }}
              />
            </a>
          </div>
        </section>

        {/* Contact Section - Two Column Layout */}
        <section className="contact-section-two-col" id="contact">
          <div className="contact-container">
            {/* Left Column - Contact Form */}
            <div className="contact-form-col">
              <h2 className="section-title-animated">
                <span className="text-say">Say</span>
                <span className="text-hello">
                  <span id="typedText"></span>
                  <span className="cursor"></span>
                </span>
              </h2>

              <form className="contact-form" onSubmit={handleContactSubmit}>
                <div className="form-group-contact">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    required
                    className="form-input-contact"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-contact">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="Your email"
                    required
                    className="form-input-contact"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                  />
                </div>

                <div className="form-group-contact">
                  <textarea
                    id="message"
                    name="message"
                    placeholder="Message"
                    required
                    rows="6"
                    className="form-input-contact"
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn-send-contact"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send message"}
                </button>

                {submitMessage && (
                  <div className={`submit-message ${submitMessage.type}`}>
                    <p className="success-text">{submitMessage.text}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Right Column - Recent Messages */}
            <div className="messages-feed-col">
              <h3 className="messages-title">Recent Messages</h3>
              <div className="messages-list">
                {messagesLoading ? (
                  <div className="messages-loading">
                    <div className="cosmic-loader">
                      <div className="orbit"></div>
                      <div className="orbit"></div>
                      <div className="orbit"></div>
                    </div>
                    <p>Loading messages...</p>
                  </div>
                ) : messages.length === 0 ? (
                  <p className="no-messages">No messages yet. Be the first!</p>
                ) : (
                  messages.map((msg) => {
                    const isOwn = isUserMessage(msg);

                    return (
                      <div
                        key={msg._id}
                        className={`message-card ${
                          isOwn ? "message-card-user" : ""
                        }`}
                      >
                        <div className="message-header">
                          <strong>{msg.name}</strong>
                          <span className="message-time">
                            {new Date(msg.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="message-text">{msg.message}</p>

                        {/* Show delete button for all user's own messages */}
                        {isOwn && msg.deleteToken && (
                          <button
                            className="btn-delete-message"
                            onClick={() =>
                              handleDeleteMessage(msg._id, msg.deleteToken)
                            }
                          >
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            Delete My Message
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Social Links */}
      <div className="social-links">
        <a
          href="https://github.com/aaditimenon"
          target="_blank"
          rel="noopener noreferrer"
          title="GitHub"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        </a>
        <a
          href="https://www.linkedin.com/in/aaditimenon"
          target="_blank"
          rel="noopener noreferrer"
          title="LinkedIn"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        </a>
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              ✕
            </button>

            <div className="modal-content">
              <h2 className="modal-title">{selectedProject.title}</h2>

              <div className="modal-section">
                <h3>Overview</h3>
                <p>{selectedProject.short_desc}</p>
              </div>

              <div className="modal-section">
                <h3>Description</h3>
                <p style={{ whiteSpace: "pre-line" }}>
                  {selectedProject.long_desc}
                </p>
              </div>

              {selectedProject.tech_stack &&
                selectedProject.tech_stack.length > 0 && (
                  <div className="modal-section">
                    <h3>Technologies</h3>
                    <div className="tech-tags">
                      {selectedProject.tech_stack.map((tech, idx) => (
                        <span key={idx} className="tech-tag">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {selectedProject.link && (
                <div className="modal-section">
                  <a
                    href={selectedProject.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                  >
                    View on GitHub →
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
