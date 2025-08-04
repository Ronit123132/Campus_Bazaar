import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Users, ShoppingBag, MessageCircle, AlertTriangle, School, Plus, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import UserManagement from '../components/admin/UserManagement';
import ProductManagement from '../components/admin/ProductManagement';
import ReportManagement from '../components/admin/ReportManagement';
import type { Stats, Campus, User, Product, Report } from '../types/admin';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_products: 0,
    total_reports: 0,
    campuses: [],
  });

  const tabs: Tab[] = [
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'products', label: 'Products', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <MessageCircle className="w-5 h-5" /> },
  ];

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/');
      return;
    }

    fetchStats();
    fetchUsers();
    fetchProducts();
    fetchReports();
  }, [user, navigate]);

  async function fetchStats() {
    const { data, error } = await supabase.rpc('get_admin_stats');
    if (error) {
      toast.error('Error fetching stats');
    } else {
      setStats(data);
    }
  }

  async function fetchUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching users');
    } else {
      setUsers(data || []);
    }
  }

  async function fetchProducts() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        price,
        moderation_status,
        created_at,
        seller:profiles (
          full_name,
          email
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching products');
    } else {
      setProducts(data || []);
    }
  }

  async function fetchReports() {
    const { data, error } = await supabase
      .from('reports')
      .select(`
        id,
        reason,
        description,
        status,
        created_at,
        reporter:profiles!reporter_id (
          full_name,
          email
        ),
        product:products (
          id,
          title,
          seller:profiles (
            full_name,
            email
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching reports');
    } else {
      setReports(data || []);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-1/3 py-4 px-1 text-center border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center justify-center gap-2">
                    {tab.icon}
                    {tab.label}
                  </div>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4">
            {activeTab === 'users' && (
              <UserManagement users={users} onRefresh={fetchUsers} stats={stats} />
            )}
            {activeTab === 'products' && (
              <ProductManagement products={products} onRefresh={fetchProducts} stats={stats} />
            )}
            {activeTab === 'reports' && (
              <ReportManagement reports={reports} onRefresh={fetchReports} stats={stats} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}