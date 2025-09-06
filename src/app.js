import React, { useState, useEffect, useRef } from 'react';
import './style.css';
// Import the Google Generative AI SDK
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

// --- ICONS & LOGO ---
const UserLogo = () => {
    return <img src="/logo.png" alt="CivicConnect Logo" className="splash-logo" />;
};
const SearchIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21L16.65 16.65" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const HomeIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const IssuesIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const LeaderboardIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 20V10M18 20V4M6 20v-4" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const ProfileIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={active ? '#4F46E5' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={active ? '#4F46E5' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const PlusIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> );

// --- MOCK DATA (MODIFIED with 'scope' property) ---
const initialIssues = [
    { id: 1, title: "Severe Pothole on Tonk Road", scope: 'local', category: "Roads", lat: 26.8500, lon: 75.8000, status: "Active", upvotes: 13, reporter: 'user1', image: 'https://images.pexels.com/photos/19131580/pexels-photo-19131580/free-photo-of-a-man-riding-a-scooter-on-a-dirt-road.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-01' },
    { id: 2, title: "Flickering Streetlight in Malviya Nagar", scope: 'local', category: "Utilities", lat: 26.8525, lon: 75.8050, status: "In Progress", upvotes: 5, reporter: 'user2', image: 'https://images.pexels.com/photos/1519753/pexels-photo-1519753.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-02' },
    { id: 4, title: "Auto Rickshaw Blocking Lane", scope: 'local', category: "Traffic", lat: 26.8510, lon: 75.7990, status: "Active", upvotes: 8, reporter: 'user1', image: 'https://images.pexels.com/photos/16301321/pexels-photo-16301321/free-photo-of-auto-rickshaw-on-a-street-in-india.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-03' },
    { id: 6, title: "Broken Traffic Signal at Gopalpura", scope: 'city', category: "Traffic", lat: 26.8600, lon: 75.8100, status: "In Progress", upvotes: 7, reporter: 'user1', image: 'https://images.pexels.com/photos/356830/pexels-photo-356830.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-05' },
    { id: 5, title: "Leaking Water Pipe on Main Sidewalk", scope: 'city', category: "Utilities", lat: 26.8550, lon: 75.8100, status: "Pending", upvotes: 3, reporter: 'user4', image: 'https://images.pexels.com/photos/2059045/pexels-photo-2059045.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-04' },
    { id: 3, title: "Garbage Dump near City Market", scope: 'city', category: "Waste", lat: 26.8480, lon: 75.8020, status: "Resolved", upvotes: 25, reporter: 'user3', image: 'https://images.pexels.com/photos/1109349/pexels-photo-1109349.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-07-28' },
    { id: 7, title: "Urgent Repair Needed on State Highway 25", scope: 'state', category: "Roads", lat: 26.8620, lon: 75.8120, status: "Pending", upvotes: 42, reporter: 'user1', image: 'https://images.pexels.com/photos/533451/pexels-photo-533451.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-06' },
    { id: 8, title: "State-wide Power Grid Instability", scope: 'state', category: "Utilities", lat: 26.8640, lon: 75.8140, status: "In Progress", upvotes: 150, reporter: 'user1', image: 'https://images.pexels.com/photos/110874/pexels-photo-110874.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-07-30' },
    { id: 9, title: "National Highway Toll Booth Malfunction", scope: 'country', category: "Traffic", lat: 26.8660, lon: 75.8160, status: "In Progress", upvotes: 520, reporter: 'user1', image: 'https://images.pexels.com/photos/164634/pexels-photo-164634.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-08-07' },
    { id: 10, title: "Policy suggestion for nationwide waste management", scope: 'country', category: "Waste", lat: 26.8680, lon: 75.8180, status: "Active", upvotes: 1080, reporter: 'user1', image: 'https://images.pexels.com/photos/208349/pexels-photo-208349.jpeg?auto=compress&cs=tinysrgb&w=600', date: '2024-07-25' }
];

const ngos = [ { id: 1, name: 'Clean Jaipur Foundation', score: 4.8, resolved: 124 }, { id: 2, name: 'Green Rajasthan Initiative', score: 4.6, resolved: 98 }, { id: 3, name: 'Urban Development Trust', score: 4.2, resolved: 75 } ];
const municipalities = [ { id: 1, name: 'Jaipur Municipal Corp.', score: 3.9, resolved: 567 }, { id: 2, name: 'Sanganer Tehsil', score: 3.5, resolved: 342 }, { id: 3, name: 'Amer Tehsil', score: 3.2, resolved: 210 } ];

// --- LOCAL STORAGE SERVICE (CORRECTED) ---
const STORAGE_KEY = 'civicConnectData';
const DATA_VERSION = 1;

const storageService = {
    getData: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const parsedData = data ? JSON.parse(data) : null;
            const defaultData = { issues: [...initialIssues], leaderboard: { ngos, municipalities }, version: DATA_VERSION };
            if (parsedData && parsedData.version === DATA_VERSION) {
                const userAddedIssues = parsedData.issues.filter(issue => !initialIssues.find(initial => initial.id === issue.id));
                const updatedInitialIssues = initialIssues.map(initial => {
                    const existing = parsedData.issues.find(issue => issue.id === initial.id);
                    return existing ? { ...initial, upvotes: existing.upvotes } : initial;
                });
                defaultData.issues = [...updatedInitialIssues, ...userAddedIssues];
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
            return defaultData;
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return { issues: initialIssues, leaderboard: { ngos, municipalities }, version: DATA_VERSION };
        }
    },
    saveData: (data) => {
        try {
            const dataWithVersion = { ...data, version: DATA_VERSION };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithVersion));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    }
};

// --- GEMINI API INTEGRATION ---
// IMPORTANT: Replace 'YOUR_GEMINI_API_KEY' with your actual API key
// For client-side, consider using environment variables and ensuring it's safe to expose.
// In a production app, you would typically proxy this through your own backend for security.
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCyo31JWOWATeZ74Vv80EhXDb1Pg7GM4aA';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Helper function to convert a Data URL to a Gemini GenerativeContent.Part
function fileToGenerativePart(dataUrl) {
    const [mimeType, base64Data] = dataUrl.split(';base64,');
    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType.replace('data:', '')
        },
    };
}

const geminiApiService = {
    generateDescriptionFromImage: async (imageDataUrl) => {
        if (!imageDataUrl) {
            return { title: "No Image Provided", description: "Please upload an image to generate a complaint." };
        }

        try {
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro-latest",
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                        threshold: HarmBlockThreshold.BLOCK_NONE,
                    },
                ],
            });

            const imagePart = fileToGenerativePart(imageDataUrl);

            const prompt = "Analyze this image and generate a concise complaint title (maximum 7 words) and a detailed description. Format the output as a JSON object with 'title' and 'description' keys. Example: { \"title\": \"Pothole on Main Road\", \"description\": \"There is a large pothole...\" }";

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Attempt to parse JSON. If parsing fails, handle gracefully.
            try {
                const parsedResult = JSON.parse(text);
                // Ensure title length is not more than 7 words
                const titleWords = parsedResult.title.split(' ');
                const formattedTitle = titleWords.length > 7 ? titleWords.slice(0, 7).join(' ') + '...' : parsedResult.title;

                return {
                    title: formattedTitle,
                    description: parsedResult.description
                };
            } catch (jsonError) {
                console.error("Failed to parse Gemini response as JSON:", text, jsonError);
                // Fallback if Gemini doesn't return perfect JSON
                return {
                    title: "AI Generation Error: Check Console",
                    description: `Could not parse AI response. Raw output: ${text}`
                };
            }

        } catch (error) {
            console.error("Error generating description from image with Gemini:", error);
            return {
                title: "AI Generation Failed",
                description: "Could not generate complaint details. Please try again or enter manually."
            };
        }
    },
    draftOfficialComplaint: async (issue) => new Promise(resolve => setTimeout(() => resolve(`To,\nThe Commissioner,\nJaipur Municipal Corporation,\n\nSubject: Formal Complaint - "${issue.title}"\n\nRespected Sir/Madam,\n\nThis is to bring to your attention the issue titled "${issue.title}", with ${issue.upvotes} upvotes. Please take action.\n\nSincerely,\nA Concerned Citizen`), 1500))
};
const mockApiService = {
    getAverageResponseTime: async (pincode) => new Promise(resolve => setTimeout(() => resolve({ days: Math.floor(Math.random() * 5) + 2 }), 1000))
};

// --- MAP COMPONENT ---
const MapComponent = ({ issues }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const L = window.L;
    useEffect(() => {
        if (L && mapContainerRef.current && !mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapContainerRef.current).setView([26.86, 75.80], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstanceRef.current);
        }
        if (mapInstanceRef.current && issues) {
            mapInstanceRef.current.eachLayer((layer) => {
                if (layer instanceof L.Marker) { mapInstanceRef.current.removeLayer(layer); }
            });
            issues.forEach(issue => {
                L.marker([issue.lat, issue.lon]).addTo(mapInstanceRef.current)
                    .bindPopup(`<b>${issue.title}</b><br>${issue.category}`);
            });
        }
    }, [issues, L]);
    return <div ref={mapContainerRef} className="map-container"></div>;
};

// --- SCREENS & COMPONENTS ---

// NEW: HomeScreen - Completely revamped to replace the carousel with a tabbed interface.
const HomeScreen = ({ issues, handleUpvote, setActiveScreen }) => {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const [activeScope, setActiveScope] = useState('Local');
    const scopes = ['Local', 'City', 'State', 'Country'];

    const STATUS_COLORS = { Active: '#EF4444', 'In Progress': '#F59E42', Pending: '#A78BFA', Resolved: '#10B981', default: '#A1A1AA' };

    const filteredIssues = issues
        .filter(issue => issue.scope?.toLowerCase() === activeScope.toLowerCase() && issue.status !== 'Resolved')
        .sort((a, b) => b.upvotes - a.upvotes);

    return (
        <div className="container">
            <div className="appHeader">
                {/* Top-left homepage logo (served from public/) */}
                <img
                    src={`${process.env.PUBLIC_URL}/HomePage Logo.png`}
                    alt="CivicConnect"
                    className="headerTopLeftLogo"
                />
                {/* Account icon on the top-right */}
                <div className="headerIcon" onClick={() => setActiveScreen('Profile')}>
                    <ProfileIcon active={false} />
                </div>
            </div>
             <MapComponent issues={issues} />
            
            <div className="issuesScopeContainer">
                <div className="scopeTabsContainer">
                    {scopes.map(scope => (
                        <button 
                            key={scope}
                            className={`scopeTab ${activeScope === scope ? 'scopeTabActive' : ''}`}
                            onClick={() => setActiveScope(scope)}
                        >
                            {scope}
                        </button>
                    ))}
                </div>
                <div className="listScrollView noPadding">
                    {filteredIssues.length > 0 ? filteredIssues.map(item => (
                        <div key={item.id} className="issueListItemV2" tabIndex={0} onClick={() => setSelectedIssue(item)}>
                            <img src={item.image} className="issueListImageV2" alt={item.title}/>
                            <div className="issueListInfoV2">
                                <p className="issueListTitleV2">{item.title}</p>
                                <p className="issueListCategoryV2">{item.category}</p>
                                <div className="issueListFooterV2">
                                    <span style={{background: STATUS_COLORS[item.status] || STATUS_COLORS.default}}>{item.status}</span>
                                    <span>{item.upvotes} upvotes</span>
                                </div>
                            </div>
                        </div>
                    )) : <div style={{textAlign: 'center', color: '#6B7280', marginTop: 40}}>No issues found for this scope.</div>}
                </div>
            </div>

            {selectedIssue && <IssueModal issue={selectedIssue} onClose={() => setSelectedIssue(null)} onUpvote={handleUpvote} />}
        </div>
    );
};
        
const IssueModal = ({ issue, onClose, onUpvote }) => {
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [draftContent, setDraftContent] = useState('');
    const [isDrafting, setIsDrafting] = useState(false);
    const handleDraftRequest = async () => { setIsDrafting(true); const draft = await geminiApiService.draftOfficialComplaint(issue); setDraftContent(draft); setIsDrafting(false); setShowDraftModal(true); };
    return (
        <div className="modalBackdrop" onClick={onClose}>
            <div className="modalView" onClick={e => e.stopPropagation()}>
                <img src={issue.image} className="modalImage" alt={issue.title} />
                <h2 className="modalTitle">{issue.title}</h2>
                <p className="modalCategory">{issue.category}</p>
                <div className="modalStatusContainer"> <span className={`modalStatus status${issue.status.replace(/\s+/g, '')}`}>{issue.status}</span> <span className="modalUpvotes">{issue.upvotes} Upvotes</span> </div>
                <p className="modalInfo">This issue is in your area. Add your voice to get it resolved faster!</p>
                <button className="modalButton" onClick={() => onUpvote(issue.id)}><span className="modalButtonText">Upvote Issue</span></button>
                <button className="modalButton geminiButton" onClick={handleDraftRequest} disabled={isDrafting}>
                    <span className="modalButtonText geminiButtonText">✨ Draft Official Complaint with AI</span>
                    {isDrafting && <div className="spinner geminiSpinner"></div>}
                </button>
                <button className="modalCloseButton" onClick={onClose}><span className="modalCloseButtonText">Close</span></button>
            </div>
            {showDraftModal && <OfficialDraftModal content={draftContent} onClose={() => setShowDraftModal(false)} />}
        </div>
    );
};

const OfficialDraftModal = ({ content, onClose }) => {
    const [copyText, setCopyText] = useState('Copy Text');
    const handleCopy = () => { navigator.clipboard.writeText(content); setCopyText('Copied!'); setTimeout(() => setCopyText('Copy Text'), 2000); };
    return (
        <div className="modalBackdrop" onClick={onClose}>
            <div className="modalView" onClick={e => e.stopPropagation()}>
                <h2 className="modalTitle">AI-Generated Complaint</h2>
                <textarea className="draftModalText" value={content} readOnly />
                <button className="modalButton" onClick={handleCopy}><span className="modalButtonText">{copyText}</span></button>
                <button className="modalCloseButton" onClick={onClose}><span className="modalCloseButtonText">Close</span></button>
            </div>
        </div>
    );
};

const AddIssueModal = ({ onClose, onAddIssue }) => {
    const [responseTime, setResponseTime] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    // NEW: image picker state & ref
    const fileInputRef = useRef(null);
    const [selectedImageDataUrl, setSelectedImageDataUrl] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState(null);

    useEffect(() => {
        const getAvgTime = async () => { const time = await mockApiService.getAverageResponseTime("303007"); setResponseTime(time.days); };
        getAvgTime();
    }, []);

    // NEW: simple local "Generate" that sets preset title & description
    const handleFakeGenerate = () => {
        setTitle('Potholes');
        setDescription('The road is riddled with numerous potholes across both lanes, causing vehicles to swerve and slowing traffic. Immediate repair is required to prevent accidents and further damage to vehicles.');
    };

    // NEW: open native file picker
    const openFilePicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    // NEW: read selected image and store data URL for preview & upload
    const handleFileChange = (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        setSelectedFileName(file.name);
        const reader = new FileReader();
        reader.onload = (ev) => {
            setSelectedImageDataUrl(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        const newIssue = { 
            title, 
            description, 
            category: "Uncategorized", // Can be AI-generated later
            scope: "local", // Can be AI-generated later
            lat: 26.85 + (Math.random() - 0.5) * 0.1, 
            lon: 75.80 + (Math.random() - 0.5) * 0.1, 
            // use selected image if provided otherwise fallback to placeholder
            image: selectedImageDataUrl || 'https://images.pexels.com/photos/162553/office-work-business-creative-162553.jpeg?auto=compress&cs=tinysrgb&w=600' 
        };
        onAddIssue(newIssue);
    };

    return (
        <div className="modalBackdrop" onClick={onClose}>
            <div className="addIssueModal" onClick={(e) => e.stopPropagation()}>
                <h2 className="addIssueTitle">Report a New Issue</h2>
                <label className="addIssueLabel">Upload Photo</label>

                {/* Hidden native file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />

                {/* Clickable picker - now opens file dialog and shows preview */}
                <div className="addIssueImagePicker" onClick={openFilePicker} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') openFilePicker(); }}>
                    {selectedImageDataUrl ? (
                        <img src={selectedImageDataUrl} alt={selectedFileName || 'Selected image'} style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12 }} />
                    ) : (
                        <span className="addIssueImagePickerText">Tap to select an image</span>
                    )}
                </div>

                {/* CHANGED: Make the AI button set a preset title & description */}
                <button
                    className="modalButton geminiButton"
                    type="button"
                    onClick={handleFakeGenerate}
                    title="Generate preset title and description"
                    style={{ cursor: 'pointer' }}
                >
                    <span className="modalButtonText geminiButtonText">✨ Generate with AI</span>
                </button>
                <label className="addIssueLabel">Location</label>
                <div className="addIssueLocation">
                    <span className="addIssueLocationText">Dahmi Kalan, Rajasthan</span>
                </div>
                {responseTime && <p className="responseTimeText">💡 Estimated response time in this area: ~{responseTime} days</p>}
                <label className="addIssueLabel">Title</label>
                <input
                    className="addIssueInput"
                    placeholder="A clear title for the issue"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={7 * 5} // Roughly 7 words, assuming average 5 chars per word + spaces
                />
                <label className="addIssueLabel">Description</label>
                <textarea
                    className="addIssueInput"
                    style={{ height: 100 }}
                    placeholder="Describe the issue in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />
                <div style={{ flex: 1 }}></div>
                <button className="modalButton addIssueSubmitButton" onClick={handleSubmit} disabled={!title || !description}>
                    <span className="modalButtonText">Submit Issue</span>
                </button>
                <button className="addIssueCloseButton" onClick={onClose}>
                    <span className="addIssueCloseButtonText">Cancel</span>
                </button>
            </div>
        </div>
    );
};

// NEW: Shared constants moved outside the AppContent component
const CATEGORY_COLORS = { Roads: '#F59E42', Utilities: '#3B82F6', Waste: '#10B981', Traffic: '#F43F5E', default: '#A1A1AA' };
const STATUS_COLORS = { Active: '#EF4444', 'In Progress': '#F59E42', Pending: '#A78BFA', Resolved: '#10B981', default: '#A1A1AA' };
        
const AppContent = () => {
    const [activeScreen, setActiveScreen] = useState('Home');
    const [showAddIssueModal, setShowAddIssueModal] = useState(false);
    const [appData, setAppData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const data = storageService.getData();
        setAppData(data);
        setIsLoading(false);
    }, []);

    const handleDataUpdate = (newAppData) => {
        setAppData(newAppData);
        storageService.saveData(newAppData);
    };

    const handleUpvote = (issueId) => {
        const updatedIssues = appData.issues.map(issue =>
            issue.id === issueId ? { ...issue, upvotes: issue.upvotes + 1 } : issue
        );
        handleDataUpdate({ ...appData, issues: updatedIssues });
    };

    const handleAddIssue = (newIssue) => {
        const newIssueWithId = { ...newIssue, id: Date.now(), upvotes: 0, status: 'Pending', reporter: 'user1', date: new Date().toISOString().slice(0,10) };
        const updatedIssues = [newIssueWithId, ...appData.issues];
        handleDataUpdate({ ...appData, issues: updatedIssues });
        setShowAddIssueModal(false);
    };

    const Toast = ({ message, onClose }) => {
        useEffect(() => {
            const timer = setTimeout(onClose, 3000);
            return () => clearTimeout(timer);
        }, [onClose]);
        return (
            <div className="toast" role="alert" aria-live="assertive">
                {message}
                <button onClick={onClose} style={{marginLeft: 16, background: 'none', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 16}}>×</button>
            </div>
        );
    };

    const MyIssueDetailModal = ({ issue, onClose, statusHistory, comments, authority, showToast }) => {
        const modalRef = useRef();
        useEffect(() => { if (modalRef.current) modalRef.current.focus(); }, []);
        const handleCopyLink = () => { navigator.clipboard.writeText(window.location.href + `#issue-${issue.id}`); showToast('Issue link copied!'); };
        const handleDownload = () => {
            const text = `Issue: ${issue.title}\nStatus: ${issue.status}\n\nTimeline:\n${statusHistory.map(s => `${s.status} - ${s.date}`).join('\n')}`;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `issue-${issue.id}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('Issue exported as text!');
        };
        return (
            <div className="modalBackdrop" onClick={onClose} aria-modal="true" role="dialog">
                <div className="modalView" ref={modalRef} onClick={e => e.stopPropagation()} style={{maxWidth: 420, outline: 'none'}} tabIndex={-1}>
                    <img src={issue.image} className="modalImage" alt={issue.title} />
                    <h2 className="modalTitle">{issue.title}</h2>
                    <span style={{ background: CATEGORY_COLORS[issue.category] || CATEGORY_COLORS.default, color: '#fff', borderRadius: 8, padding: '2px 10px', fontSize: 12, marginBottom: 8, display: 'inline-block' }}>{issue.category}</span>
                    <div style={{margin: '12px 0 8px 0', fontSize: 14, color: '#6366F1', fontWeight: 500}}>Assigned to: <span style={{color: '#4F46E5'}}>{authority.name}</span></div>
                    <div style={{margin: '16px 0'}}>
                        <div style={{fontWeight: 600, color: '#4F46E5', marginBottom: 4}}>Status Timeline</div>
                        <ol style={{paddingLeft: 18, margin: 0, color: '#334155', fontSize: 13}}>
                            {statusHistory.map((s, idx) => ( <li key={s.status} style={{marginBottom: 2, fontWeight: idx === statusHistory.length-1 ? 700 : 400}}>{s.status} <span style={{color: '#6B7280'}}>({s.date})</span></li> ))}
                        </ol>
                    </div>
                    <div style={{margin: '16px 0'}}>
                        <div style={{fontWeight: 600, color: '#4F46E5', marginBottom: 4}}>Comments & Updates</div>
                        <div style={{maxHeight: 90, overflowY: 'auto', background: '#F3F4F6', borderRadius: 8, padding: 8, marginBottom: 6}}>
                            {comments.map((c, i) => ( <div key={i} style={{marginBottom: 4}}><span style={{fontWeight: 500, color: c.user === 'You' ? '#4F46E5' : '#334155'}}>{c.user}:</span> {c.text}</div> ))}
                        </div>
                    </div>
                    <div style={{display: 'flex', gap: 8, margin: '12px 0'}}>
                        <button className="modalButton" style={{background: '#4F46E5', color: '#fff'}} onClick={handleCopyLink}>Copy Link</button>
                        <button className="modalButton" style={{background: '#10B981', color: '#fff'}} onClick={handleDownload}>Export</button>
                    </div>
                    <button className="modalCloseButton" onClick={onClose}>Close</button>
                </div>
            </div>
        );
    };
    
    const MyIssuesScreen = ({ allIssues }) => {
        const [filter, setFilter] = useState('All');
        const [sort, setSort] = useState('Newest');
        const [search, setSearch] = useState('');
        const [selectedIssue, setSelectedIssue] = useState(null);
        const [toast, setToast] = useState(null);
        const searchRef = useRef();
        useEffect(() => { if (searchRef.current) searchRef.current.focus(); }, []);

        const authorities = [{ id: 1, name: 'Jaipur Mun Corp.' }, { id: 2, name: 'Clean Foundation' }, { id: 3, name: 'Urban Trust' }];
        const getStatusHistory = (issue) => [{ status: 'Active', date: issue.date }, ...(issue.status !== 'Active' ? [{ status: issue.status, date: new Date(new Date(issue.date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0,10) }] : [])];
        const getComments = (issue) => [{ user: 'Authority', text: 'We have received your complaint.', date: issue.date }, ...(issue.status !== 'Active' ? [{ user: 'Authority', text: 'Work is in progress.', date: new Date(new Date(issue.date).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0,10) }] : [])];

        let userIssues = allIssues?.filter(i => i.reporter === 'user1');
        if (filter !== 'All') userIssues = userIssues.filter(issue => issue.status === filter);
        if (search) userIssues = userIssues.filter(issue => issue.title.toLowerCase().includes(search.toLowerCase()));
        if (sort === 'Newest') userIssues?.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sort === 'Oldest') userIssues?.sort((a, b) => new Date(a.date) - new Date(b.date));

        const filters = ['All', 'Active', 'In Progress', 'Pending', 'Resolved'];

        return (
            <div className="container" aria-label="My Reported Issues">
                <div className="header"><h1 className="headerTitle">My Reported Issues</h1></div>
                <div style={{ padding: '0 20px', marginBottom: 18 }}>
                    <input ref={searchRef} className="addIssueInput" placeholder="Search by title..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="filterContainer">
                    {filters.map(f => ( 
                        <button key={f} className={`filterButton ${filter === f ? 'filterButtonActive' : ''}`} onClick={() => setFilter(f)}>
                            <span className={`filterButtonText ${filter === f ? 'filterButtonTextActive' : ''}`}>{f}</span>
                        </button> 
                    ))}
                </div>
                <div className="listScrollView" role="list">
                    {userIssues?.length > 0 ? userIssues.map(item => (
                        <div key={item.id} className="issueListItemV2" tabIndex={0} role="listitem" onClick={() => setSelectedIssue(item)}>
                            <img src={item.image} className="issueListImageV2" alt={item.title}/>
                            <div className="issueListInfoV2">
                                <p className="issueListTitleV2">{item.title}</p>
                                <p className="issueListCategoryV2">{item.category}</p>
                                <div className="issueListFooterV2">
                                    <span style={{background: STATUS_COLORS[item.status] || STATUS_COLORS.default}}>{item.status}</span>
                                    <span>{item.upvotes} upvotes</span>
                                </div>
                            </div>
                        </div>
                    )) : <div style={{textAlign: 'center', color: '#6B7280', marginTop: 40}}>No issues found.</div>}
                </div>
                {selectedIssue && (
                    <MyIssueDetailModal
                        issue={selectedIssue}
                        onClose={() => setSelectedIssue(null)}
                        statusHistory={getStatusHistory(selectedIssue)}
                        comments={getComments(selectedIssue)}
                        authority={authorities[selectedIssue.id % authorities.length]}
                        showToast={setToast}
                    />
                )}
                {toast && <Toast message={toast} onClose={() => setToast(null)} />}
            </div>
        );
    };

    const LeaderboardScreen = ({ data }) => { 
        const LeaderboardCard = ({item, rank}) => ( <div className="leaderboardCard"> <span className="leaderboardRank">#{rank}</span> <div className="leaderboardInfo"> <p className="leaderboardName">{item.name}</p> <p className="leaderboardResolved">{item.resolved} issues resolved</p> </div> <span className="leaderboardScore">{item.score.toFixed(1)} ★</span> </div> );
        return ( <div className="container"> <div className="header"><h1 className="headerTitle">Performance Leaderboard</h1></div> <div className="listScrollView"> <h2 className="leaderboardSectionTitle">Top Performing NGOs</h2> {data?.ngos?.sort((a,b) => b.score - a.score).map((item, index) => <LeaderboardCard key={`ngo-${item.id}`} item={item} rank={index + 1} />)} <h2 className="leaderboardSectionTitle">Municipal Corporations</h2> {data?.municipalities?.sort((a,b) => b.score - a.score).map((item, index) => <LeaderboardCard key={`mun-${item.id}`} item={item} rank={index + 1} />)} </div> </div> ); 
    };
    const ProfileScreen = () => ( <div className="container"> <div className="header"><h1 className="headerTitle">Profile</h1></div> <div className="profileContent"> <div className="profileAvatar"><span className="profileAvatarText">A</span></div> <h2 className="profileName">Ansh</h2> <p className="profileEmail">ansh.sih2024@test.com</p> <button className="profileButton"><span className="profileButtonText">Edit Profile</span></button> <button className="profileButton"><span className="profileButtonText">Settings</span></button> <button className="profileButton" style={{borderColor: '#EF4444'}}><span className="profileButtonText" style={{color: '#EF4444'}}>Log Out</span></button> </div> </div> );
    
    if (isLoading || !appData) {
        return <div className="container" style={{justifyContent: 'center', alignItems: 'center'}}><div className="spinner geminiSpinner" style={{width: 50, height: 50, borderColor: '#4F46E5', borderTopColor: 'transparent'}}></div></div>;
    }

    const renderScreen = () => { 
        switch (activeScreen) { 
            case 'Home': return <HomeScreen issues={appData.issues} handleUpvote={handleUpvote} setActiveScreen={setActiveScreen} />; 
            case 'My Issues': return <MyIssuesScreen allIssues={appData.issues} />; 
            case 'Leaderboard': return <LeaderboardScreen data={appData.leaderboard} />; 
            case 'Profile': return <ProfileScreen />; 
            default: return <HomeScreen issues={appData.issues} handleUpvote={handleUpvote} setActiveScreen={setActiveScreen} />; 
        } 
    };
    
    const NavItem = ({ screenName, Icon, label }) => ( <div className="navItem" onClick={() => setActiveScreen(screenName)}> <Icon active={activeScreen === screenName} /> <span className={`navLabel ${activeScreen === screenName && 'navLabelActive'}`}>{label}</span> </div> );
    
    return (
        <div className="phone-container">
            <div className="safeArea">
                {renderScreen()}
            </div>
            <div className="fab" onClick={() => setShowAddIssueModal(true)}><PlusIcon/></div>
            <div className="navBar">
                <NavItem screenName="Home" Icon={HomeIcon} label="Home" />
                <NavItem screenName="My Issues" Icon={IssuesIcon} label="My Issues" />
                <NavItem screenName="Leaderboard" Icon={LeaderboardIcon} label="Ranks" />
            </div>
            {showAddIssueModal && <AddIssueModal onClose={() => setShowAddIssueModal(false)} onAddIssue={handleAddIssue} />}
        </div>
    );
};

const SplashScreen = () => (
    <div className="splash-screen">
        <UserLogo />
    </div>
);

const App = () => {
    const [loading, setLoading] = useState(true);
    useEffect(() => { const timer = setTimeout(() => setLoading(false), 2500); return () => clearTimeout(timer); }, []);
    return ( <div className="phone-container"> {loading ? <SplashScreen /> : <AppContent />} </div> );
};

export default App;
