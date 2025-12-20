import React from 'react';

const Founder = () => {
    return (
        <div className="min-h-screen pt-32 pb-12 px-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-lg border border-red-50 animate-fade-in-up">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        {/* Profile Image Placeholder */}
                        <div className="flex-shrink-0 relative group">
                            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                                <img
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop"
                                    alt="D. Prajith Kumar Reddy"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-3 rounded-full shadow-lg text-2xl animate-bounce">
                                👨‍💻
                            </div>
                        </div>

                        {/* Details */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                                D. Prajith Kumar Reddy
                            </h1>
                            <p className="text-xl text-primary font-bold mb-6">Founder & Lead Developer</p>

                            <div className="space-y-4 text-gray-600 mb-8">
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-lg">🎂</span>
                                    <span className="font-medium">20 Years Old</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-lg">🎓</span>
                                    <span className="font-medium">B.Tech 3rd Year Student</span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-3">
                                    <span className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-lg">🚀</span>
                                    <span className="font-medium">Full Stack & AI Enthusiast</span>
                                </div>
                            </div>

                            <p className="text-gray-500 leading-relaxed mb-8">
                                I am a passionate B.Tech 3rd-year student with a deep love for technology and innovation.
                                Specialized in building scalable web applications using the MERN stack, I strive to create
                                digital experiences that solve real-world problems. My journey is driven by curiosity and
                                a relentless pursuit of excellence in software engineering.
                            </p>

                            <div className="flex justify-center md:justify-start gap-4">
                                <a href="#" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1 transform duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 3.389 1.368 6.425 3.559 8.577l-1.559 3.423 3.423-1.559c2.152 2.191 5.188 3.559 8.577 3.559 6.626 0 12-5.373 12-12s-5.373-12-12-12z" /></svg>
                                </a>
                                <a href="https://www.linkedin.com/in/prajith-kumar-reddy-devireddy-80b87a378/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1 transform duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                </a>
                                <a href="#" className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-primary transition-colors hover:-translate-y-1 transform duration-300">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm3 8h-1.35c-.538 0-.65.221-.65.778v1.222h2l-.209 2h-1.791v7h-3v-7h-2v-2h2v-2.308c0-1.769.931-2.692 3.029-2.692 1.151 0 2.222.083 2.222.083v2.169z" /></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Founder;
