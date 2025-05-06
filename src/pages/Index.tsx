
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import { BookmarkIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    title: "Save Bookmarks",
    description: "Easily save any URL with just a click. Extract metadata including title, favicon, and summary."
  },
  {
    title: "Organize Your Content",
    description: "Keep your digital resources organized and accessible from anywhere."
  },
  {
    title: "Quick Access",
    description: "Quickly find and access your saved content through a clean and intuitive interface."
  }
];

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <section className="mb-16 text-center">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-primary">Organize</span> Your Web Experience
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Save, organize, and quickly access your favorite web content with our powerful bookmark management system.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isAuthenticated ? (
                <Button size="lg" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              ) : (
                <>
                  <Button size="lg" onClick={() => navigate('/register')}>
                    Get Started
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                    Log In
                  </Button>
                </>
              )}
            </div>
          </div>
        </section>
        
        <section className="my-16">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="p-6 border rounded-lg bg-card shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-4 text-primary">
                  <BookmarkIcon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
        
        <section className="my-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to organize your online world?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who save time by keeping their online resources organized.
          </p>
          
          {isAuthenticated ? (
            <Button size="lg" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          ) : (
            <Button size="lg" onClick={() => navigate('/register')}>
              Get Started Today
            </Button>
          )}
        </section>
      </main>
      
      <footer className="border-t py-6 bg-muted/30">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 Aura Bookmark Nexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
