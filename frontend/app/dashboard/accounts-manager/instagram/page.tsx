"use client";

import {
  Instagram,
  ShieldCheck,
  Zap,
  MessageCircle,
  BarChart3,
} from "lucide-react";

const InstagramAccountManagerPage: React.FC = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <Instagram className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Instagram Account Manager
          </h1>
          <p className="text-gray-600">
            luminex_labs • Business Account • Connected
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            Verified
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Automations
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Followers</span>
              <span className="text-2xl font-bold text-gray-900">1.2K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Following</span>
              <span className="text-2xl font-bold text-gray-900">342</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Posts</span>
              <span className="text-2xl font-bold text-gray-900">47</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Automations
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                DM Auto-Reply
              </span>
              <span className="text-green-600 text-sm font-semibold">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Comment Manager
              </span>
              <span className="text-green-600 text-sm font-semibold">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900">
                Post Scheduler
              </span>
              <span className="text-orange-600 text-sm font-semibold">
                Paused
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2 text-sm">
            <div>✅ Replied to 12 DMs</div>
            <div>📤 Scheduled 3 posts</div>
            <div>💬 Handled 28 comments</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
            Connected Services
          </h3>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mr-4">
                <Instagram className="w-6 h-6 text-pink-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">@luminex_labs</p>
                <p className="text-sm text-gray-600">
                  Primary Instagram Account
                </p>
              </div>
              <div className="text-right">
                <span className="text-green-600 text-sm font-semibold">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all">
              <Instagram className="w-8 h-8 text-pink-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">
                View Posts
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all">
              <MessageCircle className="w-8 h-8 text-blue-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">
                DM Inbox
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all">
              <Zap className="w-8 h-8 text-purple-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">
                Automations
              </span>
            </button>
            <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all">
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">
                Analytics
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramAccountManagerPage;
