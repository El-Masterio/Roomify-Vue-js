import {useLocation, useParams} from "react-router";
import {useEffect, useState} from "react";
import {getProject} from "../../lib/puter.action";

const VisualizerId = () => {
    const { id } = useParams();
    const location = useLocation();
    const state = location.state as VisualizerLocationState;

    const [projectData, setProjectData] = useState<{
        initialImage: string | null;
        name: string | null;
    }>({
        initialImage: state?.initialImage || null,
        name: state?.name || null,
    });

    const [loading, setLoading] = useState(!projectData.initialImage);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectData.initialImage && id) {
            const fetchProject = async () => {
                setLoading(true);
                try {
                    const project = await getProject(id);
                    if (project) {
                        setProjectData({
                            initialImage: project.sourceImage,
                            name: project.name || 'Untitled Project',
                        });
                    } else {
                        setError("Project not found");
                    }
                } catch (err) {
                    setError("Failed to load project");
                } finally {
                    setLoading(false);
                }
            };
            fetchProject();
        }
    }, [id, projectData.initialImage]);

    if (loading) {
        return (
            <section>
                <div className="loading">Loading project...</div>
            </section>
        );
    }

    if (error) {
        return (
            <section>
                <div className="error">{error}</div>
            </section>
        );
    }

    const { initialImage, name } = projectData;

    return (
       <section>
           <h1>{name || 'Untitled Project'}</h1>

           <div className='visualizer'>
               {initialImage && (
                   <div className='image-container'>
                       <h2>Source Image</h2>
                       <img src={initialImage} alt="Source"/>
                   </div>
               )}
           </div>
       </section>
    );
};

export default VisualizerId;