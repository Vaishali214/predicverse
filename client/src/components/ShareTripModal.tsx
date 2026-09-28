import React, { useState, useEffect } from 'react';
import { X, Share2, Copy, Check, Trash2, UserPlus, Shield, Clock } from 'lucide-react';
import { api } from '../services/api';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripTitle: string;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripTitle,
}) => {
  const [activeTab, setActiveTab] = useState<'link' | 'collaborators'>('link');

  // Share Link State
  const [shareRole, setShareRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [expirationDays, setExpirationDays] = useState<number>(0);
  const [createdLinkUrl, setCreatedLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [shareLinks, setShareLinks] = useState<any[]>([]);
  const [linkLoading, setLinkLoading] = useState<boolean>(false);

  // Collaborators State
  const [emailInput, setEmailInput] = useState<string>('');
  const [collabRole, setCollabRole] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [ownerInfo, setOwnerInfo] = useState<any>(null);
  const [collabLoading, setCollabLoading] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>('OWNER');

  // Feedback Messages
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && tripId) {
      fetchData();
    }
  }, [isOpen, tripId]);

  const fetchData = async () => {
    try {
      setErrorMsg(null);
      const [linksData, collabsData] = await Promise.all([
        api.getShareLinks(tripId).catch(() => ({ links: [] })),
        api.getCollaborators(tripId).catch(() => ({ owner: null, collaborators: [], userRole: 'VIEWER' })),
      ]);

      setShareLinks(linksData.links || []);
      setCollaborators(collabsData.collaborators || []);
      setOwnerInfo(collabsData.owner || null);
      setUserRole(collabsData.userRole || 'OWNER');
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading collaboration details.');
    }
  };

  const handleCreateShareLink = async () => {
    setLinkLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const expDays = expirationDays > 0 ? expirationDays : null;
      const data = await api.createShareLink(tripId, shareRole, expDays);
      const fullUrl = `${window.location.origin}${data.shareUrl}`;
      setCreatedLinkUrl(fullUrl);
      setSuccessMsg('Secure share link created!');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate share link.');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeLink = async (linkId: string) => {
    try {
      await api.revokeShareLink(tripId, linkId);
      setSuccessMsg('Share link revoked.');
      if (createdLinkUrl && createdLinkUrl.includes(linkId)) {
        setCreatedLinkUrl(null);
      }
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke link.');
    }
  };

  const handleAddCollaborator = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;

    setCollabLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await api.addCollaborator(tripId, emailInput.trim(), collabRole);
      setSuccessMsg(`Collaborator invited successfully as ${collabRole}!`);
      setEmailInput('');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add collaborator.');
    } finally {
      setCollabLoading(false);
    }
  };

  const handleUpdateRole = async (targetUserId: string, newRole: 'VIEWER' | 'EDITOR') => {
    try {
      await api.updateCollaboratorRole(tripId, targetUserId, newRole);
      setSuccessMsg('Collaborator role updated.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update role.');
    }
  };

  const handleRemoveCollaborator = async (targetUserId: string) => {
    try {
      await api.removeCollaborator(tripId, targetUserId);
      setSuccessMsg('Collaborator removed.');
      await fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to remove collaborator.');
    }
  };

  if (!isOpen) return null;

  const isOwner = userRole === 'OWNER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="w-full max-w-xl bg-white border-4 border-black newsprint-texture hard-shadow p-6 space-y-5 relative max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 border border-black bg-neutral-100 hover:bg-black hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="border-b-2 border-black pb-3 space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-700 uppercase tracking-widest">
            <Share2 className="w-4 h-4 text-red-700" />
            <span>GAZETTE SOCIAL DISPATCH &amp; SHARING</span>
          </div>
          <h2 className="font-serif text-2xl font-black uppercase text-black">
            TRIP COLLABORATION — {tripTitle.toUpperCase()}
          </h2>
        </div>

        {/* Notification Banners */}
        {errorMsg && (
          <div className="p-3 border border-red-800 bg-red-50 text-red-900 font-mono text-xs font-bold">
            ⚠️ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 border border-green-800 bg-green-50 text-green-900 font-mono text-xs font-bold">
            ✓ {successMsg}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 border-2 border-black bg-neutral-100 font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('link')}
            className={`py-2 px-3 text-center uppercase tracking-wider cursor-pointer border-r border-black ${
              activeTab === 'link' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-black'
            }`}
          >
            🔗 SECURE SHARE LINK
          </button>
          <button
            onClick={() => setActiveTab('collaborators')}
            className={`py-2 px-3 text-center uppercase tracking-wider cursor-pointer ${
              activeTab === 'collaborators' ? 'bg-black text-white' : 'hover:bg-neutral-200 text-black'
            }`}
          >
            👥 COLLABORATORS ({collaborators.length})
          </button>
        </div>

        {/* TAB 1: SECURE SHARE LINK */}
        {activeTab === 'link' && (
          <div className="space-y-4 text-xs font-sans">
            {isOwner ? (
              <div className="p-4 border-2 border-black bg-amber-50/60 space-y-3">
                <h3 className="font-serif font-bold text-sm uppercase text-black flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-red-700" />
                  GENERATE CRYPTOGRAPHIC SHARE TOKEN
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Access Role
                    </label>
                    <select
                      value={shareRole}
                      onChange={(e) => setShareRole(e.target.value as 'VIEWER' | 'EDITOR')}
                      className="w-full px-2.5 py-1.5 border-2 border-black bg-white text-xs font-bold uppercase"
                    >
                      <option value="VIEWER">VIEWER (Read-Only Gazette)</option>
                      <option value="EDITOR">EDITOR (Itinerary Access)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-black mb-1">
                      Link Expiration
                    </label>
                    <select
                      value={expirationDays}
                      onChange={(e) => setExpirationDays(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 border-2 border-black bg-white text-xs font-bold uppercase"
                    >
                      <option value={0}>Never Expire</option>
                      <option value={1}>1 Day (24 Hours)</option>
                      <option value={7}>7 Days (1 Week)</option>
                      <option value={30}>30 Days (1 Month)</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleCreateShareLink}
                  disabled={linkLoading}
                  className="w-full py-2 bg-black text-white font-sans text-xs font-black uppercase tracking-wider border border-black hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {linkLoading ? 'GENERATING SECURE TOKEN...' : 'CREATE SECURE SHARE LINK'}
                </button>
              </div>
            ) : (
              <div className="p-3 border border-black bg-neutral-100 font-mono text-xs text-neutral-700">
                ℹ️ Only the trip owner can create new share links.
              </div>
            )}

            {/* Generated Link Result */}
            {createdLinkUrl && (
              <div className="p-3 border-2 border-black bg-green-50 space-y-2">
                <div className="font-mono text-xs font-bold text-green-900 uppercase">
                  ACTIVE GAZETTE SHARE URL:
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdLinkUrl}
                    className="flex-1 px-2 py-1.5 border border-black bg-white font-mono text-xs text-black"
                  />
                  <button
                    onClick={() => handleCopyLink(createdLinkUrl)}
                    className="px-3 py-1.5 border border-black bg-black text-white hover:bg-neutral-800 text-xs font-bold font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'COPIED' : 'COPY'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Active Share Links List */}
            {shareLinks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-serif font-bold text-xs uppercase text-neutral-800 border-b border-black pb-1">
                  ACTIVE SHARE LINKS ({shareLinks.length})
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {shareLinks.map((link) => {
                    const fullUrl = `${window.location.origin}/shared/trips/${link.token}`;
                    return (
                      <div
                        key={link.id}
                        className="p-2.5 border border-black bg-neutral-50 flex items-center justify-between gap-2 font-mono text-xs"
                      >
                        <div className="truncate flex-1">
                          <div className="font-bold text-black flex items-center gap-1.5">
                            <span>ROLE: {link.role}</span>
                            {link.expiresAt && (
                              <span className="text-[10px] text-neutral-500 font-normal">
                                • Expires {new Date(link.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate">{fullUrl}</div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleCopyLink(fullUrl)}
                            className="p-1 border border-black bg-white hover:bg-black hover:text-white transition-colors cursor-pointer"
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {isOwner && (
                            <button
                              onClick={() => handleRevokeLink(link.id)}
                              className="p-1 border border-black bg-red-100 hover:bg-red-700 hover:text-white transition-colors text-red-900 cursor-pointer"
                              title="Revoke link"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INVITE COLLABORATORS */}
        {activeTab === 'collaborators' && (
          <div className="space-y-4 text-xs font-sans">
            {isOwner ? (
              <form onSubmit={handleAddCollaborator} className="p-3 border-2 border-black bg-amber-50/60 space-y-3">
                <h3 className="font-serif font-bold text-sm uppercase text-black flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-red-700" />
                  INVITE PREDICVERSE MEMBER
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter registered user email address..."
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full px-3 py-1.5 border-2 border-black bg-white font-mono text-xs text-black"
                    />
                  </div>
                  <div>
                    <select
                      value={collabRole}
                      onChange={(e) => setCollabRole(e.target.value as 'VIEWER' | 'EDITOR')}
                      className="w-full px-2 py-1.5 border-2 border-black bg-white text-xs font-bold uppercase"
                    >
                      <option value="VIEWER">VIEWER</option>
                      <option value="EDITOR">EDITOR</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={collabLoading}
                  className="w-full py-1.5 bg-black text-white font-sans text-xs font-black uppercase tracking-wider border border-black hover:bg-red-700 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {collabLoading ? 'INVITING...' : 'INVITE COLLABORATOR'}
                </button>
              </form>
            ) : (
              <div className="p-3 border border-black bg-neutral-100 font-mono text-xs text-neutral-700">
                ℹ️ Only the trip owner can manage collaborator memberships.
              </div>
            )}

            {/* Owner & Collaborators List */}
            <div className="space-y-2">
              <h4 className="font-serif font-bold text-xs uppercase text-neutral-800 border-b border-black pb-1">
                TRIP MEMBERSHIP LIST
              </h4>

              <div className="space-y-2">
                {/* Owner Badge */}
                {ownerInfo && (
                  <div className="p-2.5 border-2 border-black bg-neutral-100 flex items-center justify-between font-mono text-xs">
                    <div>
                      <div className="font-bold text-black">{ownerInfo.name} ({ownerInfo.email})</div>
                      <div className="text-[10px] text-neutral-500">TRIP OWNER</div>
                    </div>
                    <span className="px-2 py-0.5 bg-black text-white font-bold text-[10px] uppercase">
                      OWNER
                    </span>
                  </div>
                )}

                {/* Collaborators List */}
                {collaborators.map((collab) => (
                  <div
                    key={collab.id}
                    className="p-2.5 border border-black bg-white flex items-center justify-between gap-2 font-mono text-xs"
                  >
                    <div>
                      <div className="font-bold text-black">{collab.name} ({collab.email})</div>
                      <div className="text-[10px] text-neutral-500">ROLE: {collab.role}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner ? (
                        <>
                          <select
                            value={collab.role}
                            onChange={(e) => handleUpdateRole(collab.userId, e.target.value as 'VIEWER' | 'EDITOR')}
                            className="px-2 py-0.5 border border-black bg-neutral-50 font-bold text-[10px] uppercase"
                          >
                            <option value="VIEWER">VIEWER</option>
                            <option value="EDITOR">EDITOR</option>
                          </select>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.userId)}
                            className="p-1 border border-black bg-red-100 hover:bg-red-700 hover:text-white transition-colors text-red-900 cursor-pointer"
                            title="Remove collaborator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-0.5 bg-neutral-200 text-neutral-900 font-bold text-[10px] uppercase">
                          {collab.role}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {collaborators.length === 0 && (
                  <div className="text-center py-4 font-mono text-xs text-neutral-500 italic">
                    No active collaborators invited yet.
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
