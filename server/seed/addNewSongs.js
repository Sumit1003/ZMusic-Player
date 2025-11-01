// addNewSongs.js
import mongoose from 'mongoose';
import Song from '../models/Song.js';
import dotenv from 'dotenv';

dotenv.config();

const addNewSongs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://music_db:ROBZDFL32HQ0ncuF@musicdb.mhhzkyv.mongodb.net/musicdb?retryWrites=true&w=majority");
    console.log('✅ Connected to MongoDB');
    
    // Check current count and existing songs
    const beforeCount = await Song.countDocuments();
    console.log(`📊 Songs in database before update: ${beforeCount}`);
    
    // Check if songs 35+ already exist
    const existingHighIds = await Song.find({ id: { $gte: 35 } });
    if (existingHighIds.length > 0) {
      console.log(`⚠️  Found ${existingHighIds.length} songs with ID >= 35`);
      console.log('These will be skipped to avoid duplicates');
    }
    
    // Add your new songs (only IDs 35-56)
    const newSongs = [
      {
        id: 35,
        title: "Dhurandhar Title Track",
        artist: "Jasmine Sandlas, Hanumankind, Charanjit Ahuja",
        album: "Bollywood Songs",
        duration: "2:40",
        audio: "/songs/Dhurandhar_Title_Track.mp3",
        image: "/assets/Dhurandhar_Title_Track.jpg",
      },
      {
        id: 36,
        title: "Ab To Tera Intezaar",
        artist: "Maan Panu",
        album: "Heartbreak Songs",
        duration: "2:44",
        audio: "/songs/ab_to_tera_intezaar.mp3",
        image: "/assets/ab_to_tera_intezaar.jpeg",
      },
      {
        id: 37,
        title: "DEEWANIYAT",
        artist: "Vishal Mishra",
        album: "Bollywood Songs",
        duration: "4:17",
        audio: "/songs/DEEWANIYAT.mp3",
        image: "/assets/DEEWANIYAT.jpg",
      },
      {
        id: 38,
        title: "Ishq Bawla",
        artist: "Dhanda Nyoliwala",
        album: "Haryanvi Songs",
        duration: "4:32",
        audio: "/songs/Ishq_Bawla.mp3",
        image: "/assets/Ishq_Bawla.jpg",
      },
      {
        id: 39,
        title: "Dil Ka Jo Haal Hai",
        artist: "Abhijeet Bhattacharya, Shreya Ghoshal",
        album: "Bollywood Songs",
        duration: "3:42",
        audio: "/songs/Dil_Ka_Jo_Haal_Hai.mp3",
        image: "/assets/Dil_Ka_Jo_Haal_Hai.jpg",
      },
      {
        id: 40,
        title: "AZUL",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:18",
        audio: "/songs/AZUL.mp3",
        image: "/assets/AZUL.jpg",
      },
      {
        id: 41,
        title: "QATAL",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:54",
        audio: "/songs/QATAL.mp3",
        image: "/assets/QATAL.jpg",
      },
      {
        id: 42,
        title: "SIRRA",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:54",
        audio: "/songs/SIRRA.mp3",
        image: "/assets/SIRRA.jpg",
      },
      {
        id: 43,
        title: "IKK MUNDA",
        artist: "SHEERA JASVIR",
        album: "Punjabi Songs",
        duration: "4:48",
        audio: "/songs/IKK_MUNDA.mp3",
        image: "/assets/IKK_MUNDA.jpg",
      },
      {
        id: 44,
        title: "Itna Na Mujh Se Tu",
        artist: "Asha Parekh, Sunil Dutt",
        album: "90's Songs",
        duration: "7:38",
        audio: "/songs/Itna_Na_Mujh_Se_Tu.mp3",
        image: "/assets/Itna_Na.jpeg",
      },
      {
        id: 45,
        title: "Maruti",
        artist: "Dhanda Nyoliwala",
        album: "Haryanvi Songs",
        duration: "4:05",
        audio: "/songs/Maruti.mp3",
        image: "/assets/Maruti.jpeg",
      },
      {
        id: 46,
        title: "Mera Ji Lage Baba Mein",
        artist: "Raj Mawar, Aman Jaji, Mukesh Jaji",
        album: "Haryanvi Songs",
        duration: "3:26",
        audio: "/songs/Mera_Ji_Lage_Baba_Mein.mp3",
        image: "/assets/Mera_Ji_Lage.jpg",
      },
      {
        id: 47,
        title: "Om Namo Bhagavate",
        artist: "Sanjith Hegde, Vijay Prakash",
        album: "Bhakti Songs",
        duration: "3:32",
        audio: "/songs/Om_Namo_Bhagavate.mp3",
        image: "/assets/Om_Namo_Bhagavate.jpg",
      },
      {
        id: 48,
        title: "Pardesiya - Param Sundari",
        artist: "Sachin-Jigar, Sonu Nigam, Krishnakali",
        album: "Bollywood Songs",
        duration: "2:58",
        audio: "/songs/Pardesiya_Param_Sundari.mp3",
        image: "/assets/Pardesiya.jpg",
      },
      {
        id: 49,
        title: "PERFECT",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "3:15",
        audio: "/songs/PERFECT_Guru_Randhawa.mp3",
        image: "/assets/PERFECT.jpeg",
      },
      {
        id: 50,
        title: "Radha Gori Gori",
        artist: "Indresh Upadhyay, B Praak",
        album: "Bhakti Songs",
        duration: "5:54",
        audio: "/songs/Radha_Gori_Gori.mp3",
        image: "/assets/Radha_Gori_Gori.jpeg",
      },
      {
        id: 51,
        title: "Sahiba",
        artist: "Aditya Rikhari, Ankita Chhetri",
        album: "Hindi Songs",
        duration: "3:04",
        audio: "/songs/Sahiba.mp3",
        image: "/assets/Sahiba.jpeg",
      },
      {
        id: 52,
        title: "Tere Vaaste",
        artist: "Sachin-Jigar, Divya Kumar, Zara Khan",
        album: "Bollywood Songs",
        duration: "3:18",
        audio: "/songs/Tere Vaaste.mp3",
        image: "/assets/Tere_Vaaste.jpg",
      },
      {
        id: 53,
        title: "Lut Gaye",
        artist: "Jubin Nautiyal, Emraan Hashmi",
        album: "Bollywood Songs",
        duration: "3:48",
        audio: "/songs/Lut_Gaye.mp3",
        image: "/assets/Lut_Gaye.jpg",
      },
      {
        id: 54,
        title: "Raatan Lambiyan",
        artist: "Tanishk Bagchi, Jubin Nautiyal, Asees Kaur",
        album: "Bollywood Songs",
        duration: "3:50",
        audio: "/songs/Raatan_Lambiyan.mp3",
        image: "/assets/Raatan_Lambiyan.jpg",
      },
      {
        id: 55,
        title: "Kesariya",
        artist: "Arijit Singh, Amitabh Bhattacharya",
        album: "Bollywood Songs",
        duration: "4:28",
        audio: "/songs/Kesariya.mp3",
        image: "/assets/Kesariya.jpg",
      },
      {
        id: 56,
        title: "Mann Bharrya",
        artist: "B Praak, Jaani",
        album: "Bollywood Songs",
        duration: "4:07",
        audio: "/songs/Mann_Bharrya.mp3",
        image: "/assets/Mann_Bharrya.jpg",
      }
    ];
    
    // Insert new songs (MongoDB will skip duplicates based on id)
    const result = await Song.insertMany(newSongs, { ordered: false });
    console.log(`✅ Successfully added ${result.length} new songs`);
    
    // Verify final count
    const afterCount = await Song.countDocuments();
    console.log(`📊 Songs in database after update: ${afterCount}`);
    
    // Show newly added songs
    const latestSongs = await Song.find({ id: { $gte: 35 } }).sort({ id: 1 });
    console.log('\n🆕 Songs with ID >= 35:');
    latestSongs.forEach(song => {
      console.log(`ID: ${song.id}, Title: ${song.title}`);
    });
    
    await mongoose.disconnect();
    console.log('✅ Update completed successfully!');
    console.log(`🎵 Total songs in your music library: ${afterCount}`);
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('ℹ️  Some songs already exist (duplicate IDs), but others were added successfully');
    } else {
      console.error('❌ Error:', error);
    }
  }
};

addNewSongs();