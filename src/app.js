import React, { useState, useEffect, useRef } from 'react';
import './style.css';

// --- ICONS & LOGO ---
const UserLogo = () => {
    return <img src="/logo.png" alt="CivicConnect Logo" className="splash-logo" />;
};
// ADDED SearchIcon for the new header
const SearchIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 21L16.65 16.65" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> );
const HomeIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M9 22V12h6v10" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const IssuesIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const LeaderboardIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 20V10M18 20V4M6 20v-4" stroke={active ? '#4F46E5' : '#6B7280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const ProfileIcon = ({ active }) => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke={active ? '#4F46E5' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 11a4 4 0 100-8 4 4 0 000 8z" stroke={active ? '#4F46E5' : '#111827'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg> );
const PlusIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg> );

// --- MOCK DATA (used for first time load) ---
const initialIssues = [
    { id: 1, title: "Severe Pothole on Tonk Road", category: "Roads", lat: 26.8500, lon: 75.8000, status: "Active", upvotes: 12, reporter: 'user1', image: "https://images.pexels.com/photos/19131580/pexels-photo-19131580/free-photo-of-a-man-riding-a-scooter-on-a-dirt-road.jpeg?auto=compress&cs=tinysrgb&w=600" },
    { id: 2, title: "Flickering Streetlight in Malviya Nagar", category: "Utilities", lat: 26.8525, lon: 75.8050, status: "In Progress", upvotes: 5, reporter: 'user2', image: 'https://images.pexels.com/photos/1519753/pexels-photo-1519753.jpeg?auto=compress&cs=tinysrgb&w=600' },
    { id: 3, title: "Garbage Dump near Market", category: "Waste", lat: 26.8480, lon: 75.8020, status: "Resolved", upvotes: 25, reporter: 'user3', image: 'https://images.pexels.com/photos/1109349/pexels-photo-1109349.jpeg?auto=compress&cs=tinysrgb&w=600' },
];
const ngos = [ { id: 1, name: 'Clean Jaipur Foundation', score: 4.8, resolved: 124 }, { id: 2, name: 'Green Rajasthan Initiative', score: 4.6, resolved: 98 }, { id: 3, name: 'Urban Development Trust', score: 4.2, resolved: 75 } ];
const municipalities = [ { id: 1, name: 'Jaipur Municipal Corp.', score: 3.9, resolved: 567 }, { id: 2, name: 'Sanganer Tehsil', score: 3.5, resolved: 342 }, { id: 3, name: 'Amer Tehsil', score: 3.2, resolved: 210 } ];

// --- LOCAL STORAGE SERVICE ---
const STORAGE_KEY = 'civicConnectData';
const storageService = {
    getData: () => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) return JSON.parse(data);
            const defaultData = { issues: initialIssues, leaderboard: { ngos, municipalities } };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
            return defaultData;
        } catch (error) {
            console.error("Error accessing localStorage:", error);
            return { issues: initialIssues, leaderboard: { ngos, municipalities } };
        }
    },
    saveData: (data) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error("Error saving to localStorage:", error);
        }
    }
};

// --- MOCK API & GEMINI SERVICES ---
const geminiApiService = {
    generateDescriptionFromImage: async (image) => new Promise(resolve => setTimeout(() => resolve({ title: "Overflowing Garbage Near Public Park", description: "A large public garbage bin located near the main entrance of the community park is overflowing..." }), 1500)),
    draftOfficialComplaint: async (issue) => new Promise(resolve => setTimeout(() => resolve(`To,\nThe Commissioner,\nJaipur Municipal Corporation,\n\nSubject: Formal Complaint - "${issue.title}"\n\nRespected Sir/Madam,\n\nThis is to bring to your attention the issue titled "${issue.title}", with ${issue.upvotes} upvotes. Please take action.\n\nSincerely,\nA Concerned Citizen`), 1500))
};
const mockApiService = {
    getAverageResponseTime: async (pincode) => new Promise(resolve => setTimeout(() => resolve({ days: Math.floor(Math.random() * 5) + 2 }), 1000))
};

// --- MAP COMPONENT (This is the working version from your friend) ---
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
// MODIFIED: This is the HomeScreen with YOUR desired header
const HomeScreen = ({ issues, handleUpvote, setActiveScreen }) => {
    const [selectedIssue, setSelectedIssue] = useState(null);
    const IssueCard = ({ issue, onClick }) => (
        <div className="carouselCard" onClick={() => onClick(issue)}>
            <img src={issue.image} className="cardImage" alt={issue.title} />
            <div className="cardOverlay">
                <div>
                    <p className="cardTitle">{issue.title}</p>
                    <div className="cardFooter">
                        <span className="cardUpvotes">{issue.upvotes} Upvotes</span>
                    </div>
                </div>
            </div>
        </div>
    );
    return (
        <div className="container">
            <div className="appHeader">
                <div className="headerIcon"><SearchIcon /></div>
                <h2 className="headerLogoTitle">CivicConnect</h2>
                <div className="headerIcon" onClick={() => setActiveScreen('Profile')}><ProfileIcon active={false} /></div>
            </div>
            <MapComponent issues={issues} />
            <div className="carouselContainer">
                <h2 className="carouselTitle">Trending Near You</h2>
                <div className="carousel">
                    {issues && issues.filter(i => i.status !== 'Resolved').map(issue => <IssueCard key={issue.id} issue={issue} onClick={setSelectedIssue} />)}
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
    useEffect(() => {
        const getAvgTime = async () => { const time = await mockApiService.getAverageResponseTime("303007"); setResponseTime(time.days); };
        getAvgTime();
    }, []);
    const handleGenerate = async () => { setIsGenerating(true); const result = await geminiApiService.generateDescriptionFromImage(null); setTitle(result.title); setDescription(result.description); setIsGenerating(false); };
    const handleSubmit = () => {
        const newIssue = { title, description, category: "Uncategorized", lat: 26.85 + (Math.random() - 0.5) * 0.1, lon: 75.80 + (Math.random() - 0.5) * 0.1, image: 'https://images.pexels.com/photos/162553/office-work-business-creative-162553.jpeg?auto=compress&cs=tinysrgb&w=600' };
        onAddIssue(newIssue);
    };
    return (
        <div className="modalBackdrop">
            <div className="addIssueModal">
                <h2 className="addIssueTitle">Report a New Issue</h2>
                <label className="addIssueLabel">Upload Photo</label>
                <div className="addIssueImagePicker"><span className="addIssueImagePickerText">Tap to select an image</span></div>
                <button className="modalButton geminiButton" onClick={handleGenerate} disabled={isGenerating}>
                    <span className="modalButtonText geminiButtonText">✨ Generate with AI</span>
                    {isGenerating && <div className="spinner geminiSpinner"></div>}
                </button>
                <label className="addIssueLabel">Location</label>
                <div className="addIssueLocation"><span className="addIssueLocationText">Dahmi Kalan, Rajasthan</span></div>
                {responseTime && <p className="responseTimeText">💡 Estimated response time in this area: ~{responseTime} days</p>}
                <label className="addIssueLabel">Title</label>
                <input className="addIssueInput" placeholder="A clear title for the issue" value={title} onChange={e => setTitle(e.target.value)} />
                <label className="addIssueLabel">Description</label>
                <textarea className="addIssueInput" style={{height: 100}} placeholder="Describe the issue in detail..." value={description} onChange={e => setDescription(e.target.value)} />
                <div style={{flex: 1}}></div>
                <button className="modalButton addIssueSubmitButton" onClick={handleSubmit}><span className="modalButtonText">Submit Issue</span></button>
                <button className="addIssueCloseButton" onClick={onClose}><span className="addIssueCloseButtonText">Cancel</span></button>
            </div>
        </div>
    );
};
        
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
        const newIssueWithId = { ...newIssue, id: Date.now(), upvotes: 0, status: 'Pending', reporter: 'user1' };
        const updatedIssues = [...appData.issues, newIssueWithId];
        handleDataUpdate({ ...appData, issues: updatedIssues });
        setShowAddIssueModal(false);
    };

    const MyIssuesScreen = ({ allIssues }) => { 
        const [filter, setFilter] = useState('Active'); 
        const userIssues = allIssues?.filter(i => i.reporter === 'user1');
        const filteredIssues = userIssues?.filter(issue => filter === 'All' || issue.status === filter);
        const filters = ['Active', 'In Progress', 'Pending', 'Resolved']; 
        const IssueListItem = ({item}) => ( <div className="issueListItem"> <img src={item.image} className="issueListImage" alt={item.title}/> <div className="issueListInfo"> <div> <p className="issueListTitle">{item.title}</p> <p className="issueListCategory">{item.category}</p> </div> <div className="issueListFooter"> <span className={`modalStatus status${item.status.replace(/\s+/g, '')}`}>{item.status}</span> <span className="issueListUpvotes">{item.upvotes} upvotes</span> </div> </div> </div> );
        return ( <div className="container"> <div className="header"><h1 className="headerTitle">My Reported Issues</h1></div> <div className="filterContainer"> {filters.map(f => <button key={f} className={`filterButton ${filter === f ? 'filterButtonActive' : ''}`} onClick={() => setFilter(f)}><span className={`filterButtonText ${filter === f ? 'filterButtonTextActive' : ''}`}>{f}</span></button>)} </div> <div className="listScrollView">{filteredIssues?.map(item => <IssueListItem key={item.id} item={item} />)}</div> </div> ); 
    };
    const LeaderboardScreen = ({ data }) => { 
        const LeaderboardCard = ({item, rank}) => ( <div className="leaderboardCard"> <span className="leaderboardRank">#{rank}</span> <div className="leaderboardInfo"> <p className="leaderboardName">{item.name}</p> <p className="leaderboardResolved">{item.resolved} issues resolved</p> </div> <span className="leaderboardScore">{item.score.toFixed(1)} ★</span> </div> );
        return ( <div className="container"> <div className="header"><h1 className="headerTitle">Performance Leaderboard</h1></div> <div className="listScrollView"> <h2 className="leaderboardSectionTitle">Top Performing NGOs</h2> {data?.ngos?.sort((a,b) => b.score - a.score).map((item, index) => <LeaderboardCard key={`ngo-${item.id}`} item={item} rank={index + 1} />)} <h2 className="leaderboardSectionTitle">Municipal Corporations</h2> {data?.municipalities?.sort((a,b) => b.score - a.score).map((item, index) => <LeaderboardCard key={`mun-${item.id}`} item={item} rank={index + 1} />)} </div> </div> ); 
    };
    const ProfileScreen = () => ( <div className="container"> <div className="header"><h1 className="headerTitle">Profile</h1></div> <div className="profileContent"> <div className="profileAvatar"><span className="profileAvatarText">A</span></div> <h2 className="profileName">Ansh</h2> <p className="profileEmail">ansh.sih2024@test.com</p> <button className="profileButton"><span className="profileButtonText">Edit Profile</span></button> <button className="profileButton"><span className="profileButtonText">Settings</span></button> <button className="profileButton" style={{borderColor: '#EF4444'}}><span className="profileButtonText" style={{color: '#EF4444'}}>Log Out</span></button> </div> </div> );
    
    if (isLoading) {
        return <div className="container" style={{justifyContent: 'center', alignItems: 'center'}}><div className="spinner geminiSpinner" style={{width: 50, height: 50, borderColor: '#4F46E5', borderTopColor: 'transparent'}}></div></div>;
    }

    const renderScreen = () => { 
        switch (activeScreen) { 
            // MODIFIED: Pass all required props to HomeScreen
            case 'Home': return <HomeScreen issues={appData.issues} handleUpvote={handleUpvote} setActiveScreen={setActiveScreen} />; 
            case 'My Issues': return <MyIssuesScreen allIssues={appData.issues} />; 
            case 'Leaderboard': return <LeaderboardScreen data={appData.leaderboard} />; 
            case 'Profile': return <ProfileScreen />; 
            default: return <HomeScreen issues={appData.issues} handleUpvote={handleUpvote} setActiveScreen={setActiveScreen} />; 
        } 
    };
    
    const NavItem = ({ screenName, Icon, label }) => ( <div className="navItem" onClick={() => setActiveScreen(screenName)}> <Icon active={activeScreen === screenName} /> <span className={`navLabel ${activeScreen === screenName && 'navLabelActive'}`}>{label}</span> </div> );
    
    return (
        <div className="safeArea">
            {renderScreen()}
            <div className="fab" onClick={() => setShowAddIssueModal(true)}><PlusIcon/></div>
            {/* MODIFIED: This is the navBar with the Profile tab removed */}
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