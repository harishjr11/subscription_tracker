import e from "express";
import Subscription from "../models/subscription.model.js";
import { SERVER_URL } from "../config/env.js";
import mongoose from "mongoose";
import dayjs from "dayjs";

export const createSubscription = async (req, res) => {
    try {
        const subscription =  Subscription.create({
            ...req.body,
            user: req.user._id,
        });


        res.status(201).json({success: true, message:'Subscription added successfullyy', data: subscription })

    } catch (error) {
        next(error);
    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
      // Check if the user is the same as the one in the token
      if(req.user.id !== req.params.id) {
        const error = new Error('You are not the owner of this account');
        error.status = 401;
        throw error;
      }
  
      const subscriptions = await Subscription.find({ user: req.params.id });
  
      res.status(200).json({ success: true, data: subscriptions });
    } catch (e) {
      next(e);
    }
  }


  export const editSubscription = async (req, res, next) => {
      try {
          const { id } = req.params;
          const updates = req.body;
  
          // Find the subscription
          let subscription = await Subscription.findById(id);
          if (!subscription) {
              return res.status(404).json({ success: false, message: "Subscription not found" });
          }
  
          // Ensure only the user can update their subscription
          if (req.user.id !== subscription.user.toString()) {
              return res.status(401).json({ success: false, message: "You are not authorized to update this subscription" });
          }
  
          // If startDate is updated, ensure it's in the correct format
          if (updates.startDate) {
              updates.startDate = new Date(updates.startDate);
              if (isNaN(updates.startDate.getTime())) {
                  return res.status(400).json({ success: false, message: "Invalid startDate format" });
              }
          }
  
          // Frequency mapping for renewal calculation
          const renewalPeriods = {
              daily: 1,
              weekly: 7,
              monthly: 30,
              yearly: 365,
          };
  
          // Calculate renewalDate if startDate or frequency is updated
          if (updates.startDate || updates.frequency) {
              const newStartDate = updates.startDate ? dayjs(updates.startDate) : dayjs(subscription.startDate);
              const newFrequency = updates.frequency || subscription.frequency;
  
              if (!newStartDate.isValid()) {
                  return res.status(400).json({ success: false, message: "Invalid startDate format" });
              }
  
              // Calculate new renewalDate and convert to JS Date object
              const newRenewalDate = newStartDate.add(renewalPeriods[newFrequency], "day").toDate();
  
              if (newRenewalDate < newStartDate.toDate()) {
                  return res.status(400).json({ success: false, message: "Renewal date must be after the start date" });
              }
  
              updates.renewalDate = newRenewalDate; // ✅ Store as a JS Date
          }
  
          // Update the subscription
          const updatedSubscription = await Subscription.findByIdAndUpdate(
              id,
              { $set: updates },
              { new: true, runValidators: true }
          );
  
          // Update status based on renewalDate
          updatedSubscription.status = updatedSubscription.renewalDate < new Date() ? "expired" : "active";
          await updatedSubscription.save();
  
          res.status(200).json({
              success: true,
              message: "Subscription updated successfully",
              data: updatedSubscription,
          });
  
      } catch (error) {
          next(error);
      }
  };
  
