import { User, UserRole } from "@/schemas/user-schema";
import { DUMMY_CLIENTS, DUMMY_TECHNICIANS, DUMMY_ADMINS } from '@/data/dummy-users';

// Simulated JWT token structure
export interface SimulatedJWT {
    userId: string;
    userType: UserRole;
    email: string;
    iat: number;
    exp: number;
}

// Password hashing simulation (in real app, use bcrypt)
export function hashPassword(password: string): string {
    // Simple hash simulation - in production use bcrypt
    return btoa(password + "_servigo_salt");
}

export function verifyPassword(password: string, hash: string): boolean {
    return hash === hashPassword(password);
}

// JWT simulation functions
export function createJWT(user: User): string {
    const payload: SimulatedJWT = {
        userId: user.user_id,
        userType: user.user_type,
        email: user.email,
        iat: Date.now(),
        exp: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
    };

    return btoa(JSON.stringify(payload));
}

export function verifyJWT(token: string): SimulatedJWT | null {
    try {
        const payload = JSON.parse(atob(token)) as SimulatedJWT;

        // Check if token is expired
        if (payload.exp < Date.now()) {
            return null;
        }

        return payload;
    } catch {
        return null;
    }
}

// Local storage keys
const STORAGE_KEYS = {
    USERS: 'servigo_users',
    CURRENT_USER: 'servigo_current_user',
    JWT_TOKEN: 'servigo_jwt_token',
} as const;

// User storage simulation
export class UserStorage {
    private static getUsers(): User[] {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem(STORAGE_KEYS.USERS);
        return stored ? JSON.parse(stored) : [];
    }

    private static saveUsers(users: User[]): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    static async createUser(userData: Omit<User, 'user_id' | 'date_created'>): Promise<User> {
        const users = this.getUsers();

        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            throw new Error('Email already exists');
        }

        // Create user with proper type-specific fields
        let newUser: User;
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        if (userData.user_type === 'client') {
            newUser = {
                ...userData,
                user_id: userId,
                date_created: new Date(),
                client_id: `client_${Date.now()}`,
                user_type: 'client' as const,
            };
        } else if (userData.user_type === 'technician') {
            newUser = {
                ...userData,
                user_id: userId,
                date_created: new Date(),
                technician_id: `tech_${Date.now()}`,
                user_type: 'technician' as const,
                years_of_experience: 0,
                identity_verified: false,
                is_available: true,
            };
        } else {
            newUser = {
                ...userData,
                user_id: userId,
                date_created: new Date(),
                admin_id: `admin_${Date.now()}`,
                admin_role: 'support',
                user_type: 'admin' as const,
            };
        }

        users.push(newUser);
        this.saveUsers(users);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return newUser;
    }

    static async findUserByEmail(email: string): Promise<User | null> {
        const users = this.getUsers();
        const user = users.find(u => u.email === email);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return user || null;
    }

    static async findUserById(userId: string): Promise<User | null> {
        const users = this.getUsers();
        const user = users.find(u => u.user_id === userId);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return user || null;
    }

    static async updateUser(userId: string, updates: Partial<User>): Promise<User | null> {
        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.user_id === userId);

        if (userIndex === -1) return null;

        // Merge updates while maintaining type safety
        const currentUser = users[userIndex];
        users[userIndex] = { ...currentUser, ...updates } as User;
        this.saveUsers(users);

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 300));

        return users[userIndex];
    }
}

// Authentication simulation
export class AuthSimulation {
    static async register(userData: {
        email: string;
        password: string;
        first_name: string;
        last_name: string;
        phone_number: string;
        user_type: UserRole;
    }): Promise<{ user: User; token: string }> {
        // Validate input
        const validatedData = {
            email: userData.email,
            password_hash: hashPassword(userData.password),
            first_name: userData.first_name,
            last_name: userData.last_name,
            phone_number: userData.phone_number,
            user_type: userData.user_type,
            is_active: true,
        };

        const user = await UserStorage.createUser(validatedData);
        const token = createJWT(user);

        // Store current session
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
        }

        return { user, token };
    }

    static async login(email: string, password: string): Promise<{ user: User; token: string }> {
        const user = await UserStorage.findUserByEmail(email);

        if (!user) {
            throw new Error('Invalid email or password');
        }

        if (!verifyPassword(password, user.password_hash)) {
            throw new Error('Invalid email or password');
        }

        if (!user.is_active) {
            throw new Error('Account is deactivated');
        }

        // Update last login
        await UserStorage.updateUser(user.user_id, {
            last_login: new Date(),
        });

        const token = createJWT(user);

        // Store current session
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            localStorage.setItem(STORAGE_KEYS.JWT_TOKEN, token);
        }

        return { user, token };
    }

    static async logout(): Promise<void> {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            localStorage.removeItem(STORAGE_KEYS.JWT_TOKEN);
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    static getCurrentUser(): User | null {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return stored ? JSON.parse(stored) : null;
    }

    static getCurrentToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(STORAGE_KEYS.JWT_TOKEN);
    }

    static isAuthenticated(): boolean {
        const token = this.getCurrentToken();
        if (!token) return false;

        const payload = verifyJWT(token);
        return payload !== null;
    }

    static getCurrentUserRole(): UserRole | null {
        const user = this.getCurrentUser();
        return user?.user_type || null;
    }

    static hasRole(requiredRole: UserRole): boolean {
        const userRole = this.getCurrentUserRole();
        return userRole === requiredRole;
    }

    static hasAnyRole(requiredRoles: UserRole[]): boolean {
        const userRole = this.getCurrentUserRole();
        return userRole ? requiredRoles.includes(userRole) : false;
    }
}

// Initialize with dummy users from data folder
export function initializeDummyUsers(): void {
    if (typeof window === 'undefined') return;

    const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (existingUsers) return; // Already initialized

    // Combine all dummy users and hash their passwords
    const dummyUsers: User[] = [
        ...DUMMY_CLIENTS.map((user) => ({
            ...user,
            password_hash: hashPassword('password123'), // Set a standard password for demo
        })),
        ...DUMMY_TECHNICIANS.map((user) => ({
            ...user,
            password_hash: hashPassword('password123'), // Set a standard password for demo
        })),
        ...DUMMY_ADMINS.map((user) => ({
            ...user,
            password_hash: hashPassword('password123'), // Set a standard password for demo
        })),
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(dummyUsers));
}
