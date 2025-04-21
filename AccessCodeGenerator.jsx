import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const generateUniqueCode = () => {
  // Generate a random 8-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
};

const AccessCodeGenerator = ({ userId, purchaseId }) => {
  const [accessCode, setAccessCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) {
    return <div className="access-code-loading">Generating your access code...</div>;
  }

  if (error) {
    return <div className="access-code-error">{error}</div>;
  }

  return (
    <div className="access-code-container">
      <h3>Your Access Code</h3>
      <div className="access-code-display">{accessCode}</div>
      <p className="access-code-instructions">
        Save this code in a safe place. You'll need it to access your purchase.
      </p>
    </div>
  );
};

export default AccessCodeGenerator; 