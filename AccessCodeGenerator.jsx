import React, { useState, useEffect, useCallback } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const generateUniqueCode = () => {
  // Generate a random 16-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 16; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const AccessCodeGenerator = ({ userId, purchaseId }) => {
  const [accessCode, setAccessCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const checkExistingCode = async () => {
      try {
        setLoading(true);
        
        // Check if a code already exists for this purchase
        const codesRef = collection(db, 'purchase_codes');
        const q = query(codesRef, where('purchaseId', '==', purchaseId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // Code already exists, retrieve it
          const existingCode = querySnapshot.docs[0].data().code;
          setAccessCode(existingCode);
        } else {
          // Generate a new code
          const newCode = generateUniqueCode();
          
          // Save to Firebase
          await addDoc(collection(db, 'purchase_codes'), {
            code: newCode,
            userId: userId,
            purchaseId: purchaseId,
            createdAt: new Date(),
            used: false
          });
          
          setAccessCode(newCode);
        }
      } catch (err) {
        console.error('Error generating access code:', err);
        setError('Failed to generate access code. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    // Only run this once
    if (userId && purchaseId) {
      checkExistingCode();
    } else {
      setError('Missing user ID or purchase ID');
      setLoading(false);
    }
  }, [userId, purchaseId]);

  const copyToClipboard = useCallback(() => {
    if (!accessCode) return;
    
    navigator.clipboard.writeText(accessCode)
      .then(() => {
        setCopyStatus('Copied!');
        setIsCopied(true);
        
        setTimeout(() => {
          setCopyStatus('Copy');
          setIsCopied(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        setCopyStatus('Failed to copy');
        
        setTimeout(() => {
          setCopyStatus('Copy');
        }, 2000);
      });
  }, [accessCode]);

  if (loading) {
    return <div className="access-code-loading">Generating your access code...</div>;
  }

  if (error) {
    return <div className="access-code-error">{error}</div>;
  }

  return (
    <div className="access-code-container">
      <h3>Your Access Code</h3>
      <div className="access-code-display">
        <div className="code-wrapper">
          <span className="code-text">{accessCode}</span>
          <button 
            onClick={copyToClipboard}
            className={`copy-button ${isCopied ? 'copied' : ''}`}
          >
            {copyStatus}
          </button>
        </div>
      </div>
      <p className="access-code-instructions">
        Save this code in a safe place. You'll need it to access your purchase.
      </p>
      <style jsx>{`
        .access-code-container {
          margin: 20px;
          padding: 20px;
          border-radius: 8px;
          background-color: #f9f9f9;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        
        .access-code-display {
          position: relative;
          margin: 20px 0;
          padding: 15px;
          background-color: #fff;
          border: 1px dashed #ccc;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .code-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 10px;
        }
        
        .code-text {
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 2px;
        }
        
        .copy-button {
          margin-left: 10px;
          padding: 8px 12px;
          background-color: #0366d6;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: background-color 0.2s;
        }
        
        .copy-button:hover {
          background-color: #0256b9;
        }
        
        .copy-button.copied {
          background-color: #28a745;
        }
        
        .access-code-instructions {
          font-size: 14px;
          color: #666;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
};

export default AccessCodeGenerator; 