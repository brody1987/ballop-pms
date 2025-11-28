import { Project, User, Notification, WorkflowStep, Attachment } from '../types';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut, 
  onAuthStateChanged, 
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  setDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';

// --- CONSTANTS ---

// Default Config provided
const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAIYfXUskFUdEyZuy4D55EOYcTH8L9ylgE",
  authDomain: "ballop-pms-f501a.firebaseapp.com",
  databaseURL: "https://ballop-pms-f501a-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ballop-pms-f501a",
  storageBucket: "ballop-pms-f501a.firebasestorage.app",
  messagingSenderId: "180157641116",
  appId: "1:180157641116:web:56a919c68f1c57bb151859"
};

const SAMPLE_STEPS_TEMPLATE: WorkflowStep[] = [
  { id: 's1', label: 'TDS 제작', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 's2', label: '샘플 오더 리스트', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 's3', label: '가격 문의 및 TDS', owner: 'GTS', status: 'pending', files: [] },
  { id: 's4', label: '샘플 오더폼 제작', owner: 'GTS', status: 'pending', files: [] },
  { id: 's5', label: '샘플 가격 전달', owner: 'Factory', status: 'pending', files: [] },
  { id: 's6', label: '샘플 개발 시작', owner: 'Factory', status: 'pending', files: [] },
  { id: 's7', label: '배송 정보 전달', owner: 'GTS', status: 'pending', files: [] },
  { id: 's8', label: '샘플 발송', owner: 'Factory', status: 'pending', files: [] },
  { id: 's9', label: '샘플 수령 및 피드백', owner: 'Donau Sports', status: 'pending', files: [] }
];

const MAIN_STEPS_TEMPLATE: WorkflowStep[] = [
  { id: 'm1', label: '메인 오더 리스트', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 'm2', label: '오더폼 제작 및 전달', owner: 'GTS', status: 'pending', files: [] },
  { id: 'm3', label: '최종 작지 전달', owner: 'GTS', status: 'pending', files: [] },
  { id: 'm4', label: '30% 선금 결제', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 'm5', label: 'EAN Code 요청', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 'm6', label: '제품 생산 시작', owner: 'Factory', status: 'pending', files: [] },
  { id: 'm7', label: '박스&라벨 디자인', owner: 'Donau Sports', status: 'pending', files: [] },
  { id: 'm8', label: 'QC 사진 요청', owner: 'Factory', status: 'pending', files: [] },
  { id: 'm9', label: '선적 서류(Shipping Docs)', owner: 'GTS', status: 'pending', files: [] },
  { id: 'm10', label: '70% 잔금 결제', owner: 'Donau Sports', status: 'pending', files: [] }
];

// --- FIREBASE SERVICE ---

class FirebaseService {
  private app: FirebaseApp | undefined;
  private auth: any;
  private db: any;
  private storage: any;
  private currentUser: User | null = null;

  constructor() {
    this.initialize();
  }

  // --- CONFIGURATION ---
  
  initialize() {
    try {
      const storedConfig = localStorage.getItem('firebaseConfig');
      const config = storedConfig ? JSON.parse(storedConfig) : DEFAULT_FIREBASE_CONFIG;
      
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      this.storage = getStorage(this.app);

      // Listen for auth state changes
      onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch additional user details from Firestore
          const userDoc = await getDoc(doc(this.db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            this.currentUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userData.name || firebaseUser.displayName || 'User',
              role: userData.role || 'user',
              permissions: userData.permissions || { read: true, write: false },
              avatar: userData.avatar || firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${firebaseUser.email}`
            };
          } else {
             // Fallback if user doc doesn't exist yet
             this.currentUser = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'user',
              permissions: { read: true, write: false },
              avatar: `https://ui-avatars.com/api/?name=${firebaseUser.email}`
             };
          }
        } else {
          this.currentUser = null;
        }
      });
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
    }
  }

  updateConfig(configStr: string) {
    try {
      JSON.parse(configStr); // Validate JSON
      localStorage.setItem('firebaseConfig', configStr);
      window.location.reload(); // Reload to apply changes
    } catch (e) {
      throw new Error("Invalid JSON Configuration");
    }
  }

  getConfig(): string {
    return localStorage.getItem('firebaseConfig') || JSON.stringify(DEFAULT_FIREBASE_CONFIG, null, 2);
  }

  // --- AUTH ---

  async login(email: string, password: string): Promise<User> {
    if (!this.auth) throw new Error("Firebase not initialized");
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get extended profile
    const userDocRef = doc(this.db, 'users', firebaseUser.uid);
    const userDoc = await getDoc(userDocRef);
    
    let userData: any = {};
    if (userDoc.exists()) {
       userData = userDoc.data();
    }

    this.currentUser = {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: userData.name || firebaseUser.displayName || 'User',
      role: userData.role || 'user',
      permissions: userData.permissions || { read: true, write: true },
      avatar: userData.avatar || `https://ui-avatars.com/api/?name=${email}`
    };
    
    return this.currentUser;
  }

  async register(email: string, password: string, name: string): Promise<User> {
     if (!this.auth) throw new Error("Firebase not initialized");
     const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
     const firebaseUser = userCredential.user;

     // Create User Profile in Firestore
     const newUser: User = {
        id: firebaseUser.uid,
        email: email,
        name: name,
        role: 'user', // Default role
        permissions: { read: true, write: true }, // Default permissions
        avatar: `https://ui-avatars.com/api/?name=${name}`
     };

     await setDoc(doc(this.db, 'users', firebaseUser.uid), {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        permissions: newUser.permissions,
        avatar: newUser.avatar,
        createdAt: new Date().toISOString()
     });
     
     // Update Auth Profile
     await updateProfile(firebaseUser, { displayName: name });

     this.currentUser = newUser;
     return newUser;
  }

  logout() {
    if (this.auth) signOut(this.auth);
    this.currentUser = null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // --- PROJECTS ---

  async getProjects(): Promise<Project[]> {
    if (!this.db) return [];
    const q = query(collection(this.db, 'projects'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
  }

  async getProjectById(id: string): Promise<Project | undefined> {
    if (!this.db) return undefined;
    const docRef = doc(this.db, 'projects', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Project;
    }
    return undefined;
  }

  async addProject(projectData: Omit<Project, 'id' | 'status' | 'progress' | 'isDelayed' | 'hasIssue' | 'comments' | 'steps'>): Promise<Project> {
    if (!this.db) throw new Error("Database not connected");
    
    const stepsTemplate = projectData.type === 'Main' ? MAIN_STEPS_TEMPLATE : SAMPLE_STEPS_TEMPLATE;
    const steps = JSON.parse(JSON.stringify(stepsTemplate)); // Deep copy

    const newProjectData = {
      ...projectData,
      status: 'In Progress',
      progress: 0,
      isDelayed: false,
      hasIssue: false,
      steps: steps,
      comments: [],
      createdAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(this.db, 'projects'), newProjectData);
    return { id: docRef.id, ...newProjectData } as Project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
      if (!this.db) throw new Error("Database not connected");
      const docRef = doc(this.db, 'projects', id);
      await updateDoc(docRef, updates);
      
      const updatedSnap = await getDoc(docRef);
      return { id: updatedSnap.id, ...updatedSnap.data() } as Project;
  }

  // --- FILES (STORAGE) ---

  async addFileToStep(projectId: string, stepId: string, file: any): Promise<void> {
    if (!this.storage || !this.db) throw new Error("Storage/DB not connected");

    // 1. Upload file to Firebase Storage
    const storageRef = ref(this.storage, `projects/${projectId}/${stepId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    // 2. Create Attachment Object
    const newAttachment: Attachment = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        type: file.type,
        url: downloadURL,
        uploadedAt: new Date().toLocaleDateString(),
        uploadedBy: this.currentUser?.name || 'Unknown'
    };

    // 3. Update Firestore Project Document (Find step and append file)
    // Note: Updating a specific item in an array in Firestore is tricky. 
    // We read the project, modify the steps array, and write it back.
    const project = await this.getProjectById(projectId);
    if (project) {
        const updatedSteps = project.steps.map(s => {
            if (s.id === stepId) {
                return { ...s, files: [...s.files, newAttachment] };
            }
            return s;
        });
        await this.updateProject(projectId, { steps: updatedSteps });
    }
  }

  // --- USERS (ADMIN) ---

  async getUsers(): Promise<User[]> {
      if (!this.db) return [];
      const querySnapshot = await getDocs(collection(this.db, 'users'));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  }

  async updateUserPermissions(id: string, permissions: { read: boolean; write: boolean }): Promise<void> {
      if (!this.db) throw new Error("Database not connected");
      const docRef = doc(this.db, 'users', id);
      await updateDoc(docRef, { permissions });
  }

  // --- NOTIFICATIONS ---
  
  async getNotifications(): Promise<Notification[]> {
      // In a real app, this would be a subcollection or separate collection
      // For now, returning mock data or empty to avoid errors if collection missing
      if (!this.db) return [];
      try {
        const q = query(collection(this.db, 'notifications'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      } catch (e) {
          console.log("No notifications collection yet");
          return [];
      }
  }
}

export const db = new FirebaseService();
