import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Song from '../models/Song.js';
import { connectDB, getConnectionStatus } from '../config/db.js';


console.log("🟢 seedData.js started running...");

dotenv.config();

const songs = [
    {
        id: 1,
        title: "Syahi",
        artist: "Sinta Bhai",
        album: "Haryanvi Songs",
        duration: "4:26",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986551/ZMusic/images/q5fny9driageiyxgrbf2.jpg",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986685/ZMusic/songs/trty3ogv2wxmwjek1att.mp3"
    },
    {
        id: 2,
        title: "Chand_Chhupa_Badal_Mein",
        artist: "Udit Narayan and Alka Yagnik.",
        album: "Bollywood Songs",
        duration: "5:47",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986566/ZMusic/songs/keibersvugzcegvqrkw2.mp4",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986502/ZMusic/images/hf1nyflpc4fvpqsspdau.jpg",
    },
    {
        id: 3,
        title: "Chahun_Main_Ya_Naa",
        artist: "Arijit Singh and Palak Muchha",
        album: "Bollywood Songs",
        duration: "5:04",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986564/ZMusic/songs/h8sxzohfbqnuwgkmvfwl.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986501/ZMusic/images/irzmfbocvrzp38drmbmz.jpg",
    },
    {
        id: 4,
        title: "Channa_Mereya",
        artist: "Arijit Singh",
        album: "Bollywood Songs",
        duration: "4:49",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986574/ZMusic/songs/risyhhsk72o3d0viepoq.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986503/ZMusic/images/l6tiqaf3ihhtzqvssg8v.jpg",
    },
    {
        id: 5,
        title: "Ishq Hai",
        artist: "Mismatched",
        album: "Bollywood Songs",
        duration: "2:02",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986590/ZMusic/songs/xflfz2o9zlogaimzxjnt.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986511/ZMusic/images/xcvalgvg48bnro2ma4pj.jpg",
    },
    {
        id: 6,
        title: "Channa",
        artist: "Gippy Grewal, Jatinder Shah, and Raj Kakra ‧ 2011",
        album: "Punjabi Songs",
        duration: "5:54",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986572/ZMusic/songs/h91hicj9xevsdqxhaset.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986503/ZMusic/images/smf99lxuoopogqxaqlaa.jpg",
    },
    {
        id: 7,
        title: "Ijazat.mp3",
        artist: "Nehaal Naseem | Falak Shabir",
        album: "Punjabi Songs",
        duration: "1:30",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986585/ZMusic/songs/slhjikonhrpq5csubgcr.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761991451/ZMusic/images/zqg2ymfnkraqpucuum4k.jpg",
    },
    {
        id: 8,
        title: "Jhol",
        artist: "Annural Khalid and Maanu ‧ 2024",
        album: "Punjabi Songs",
        duration: "4:38",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986604/ZMusic/songs/syjwqvmqzk5hyk6qggf3.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986516/ZMusic/images/o7qsoa3svmbhgjbvrwcb.jpg",
    },
    {
        id: 9,
        title: "Dil_To_Pagal_Hai",
        artist: "Lata Mangeshkar and Udit Narayan",
        album: "Bollywood Songs",
        duration: "5:36",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986584/ZMusic/songs/mt4tyt1ldvvt6ihaxpsn.mp4",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986507/ZMusic/images/kcj8nrmqlkkqxub5iieb.jpg",
    },
    {
        id: 10,
        title: "Jeene_Laga_Hoon__",
        artist: " Atif Aslam and Shreya Ghoshal",
        album: "Bollywood Songs",
        duration: "3:56",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986600/ZMusic/songs/tnytmnb5apwzm8p8fs9v.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986515/ZMusic/images/r7cvskhhrxxordaocqzx.jpg",
    },
    {
        id: 11,
        title: "Kaabil_Hoon",
        artist: " Jubin Nautiyal and Palak Muchhal ‧",
        album: "Bollywood Songs",
        duration: "5:14",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986613/ZMusic/songs/a3rlvmhwa4btqdddtmdc.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761991462/ZMusic/images/fxeyhosn6dcdpjiq6v9l.jpg",
    },
    {
        id: 12,
        title: "Main_Rang_Sharbaton_Ka",
        artist: " Atif Aslam and Chinmayi  ‧",
        album: "Bollywood Songs",
        duration: "4:37",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986622/ZMusic/songs/cx26vbhnwvkkanmsh7ln.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986545/ZMusic/images/l7dfaaqmdh267a5aeh7j.jpg",
    },
    {
        id: 13,
        title: "Manwa_Laage",
        artist: " Arijit Singh, Shreya Ghoshal, Vishal–Shekhar, Irshad Kamil  ‧",
        album: "Bollywood Songs",
        duration: "4:32",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986632/ZMusic/songs/n0na9ibdsio08dacc1bf.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986532/ZMusic/images/vr6xlz9gnpktfzzy0uet.jpg",
    },
    {
        id: 14,
        title: "Jogi - Lyrical  Shaadi Mein Zaroor Aana",
        artist: " Akanksha Sharma and Yasser Desai ‧ 2017",
        album: "Bollywood Songs",
        duration: "4:39",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986611/ZMusic/songs/kjifsbohjsqlpg0gllr7.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986519/ZMusic/images/qxuinpr2esnuaqjkkzk8.jpg",
    },
    {
        id: 15,
        title: "Syahi (Official audio) ",
        artist: " Sinta Bhai  Gold E Gill  Mahi Dhaka ",
        album: "Haryanvi Songs",
        duration: "4:26",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986685/ZMusic/songs/trty3ogv2wxmwjek1att.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986551/ZMusic/images/q5fny9driageiyxgrbf2.jpg",
    },
    {
        id: 16,
        title: "Jhumke  Parmish Verma  Wamiqa Gabbi   ",
        artist: "Parmish Verma, Sajjan Adeeb",
        album: "Punjabi Songs",
        duration: "2:59",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986606/ZMusic/songs/ztri6bnjwzxcf8l2omte.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761991459/ZMusic/images/kbugozxgp3zxz0hzbxmk.jpg",
    },
    {
        id: 17,
        title: "Churake - Vilen X Kanika Kapoor (Official Audio)",
        artist: " Vilen X Kanika Kapoor",
        album: "Punjabi Songs",
        duration: "2:34",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761991542/ZMusic/songs/vurojbdyehgweploirtk.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986504/ZMusic/images/gcn8sfsdnfmhixru46v0.jpg",
    },
    {
        id: 18,
        title: "Sifat _ Parmish Verma Ft. Mahira Sharma ",
        artist: " Parmish Verma Ft. Mahira Sharma",
        album: "Punjabi Songs",
        duration: "1:52",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986675/ZMusic/songs/zvuai9dqxy9yiwrcxzxy.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986549/ZMusic/images/eg1vmoobbxyzjmiexzzb.jpg",
    },
    {
        id: 19,
        title: "Jaane Dil Mein - Full Song  ",
        artist: " Lata Mangeshkar and Sonu Nigam",
        album: "Bollywood Songs",
        duration: "5:48",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986599/ZMusic/songs/z3s3anwcxjl47tala00j.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986514/ZMusic/images/irp3h6ye8wpojobx2lyz.jpg",
    },
    {
        id: 20,
        title: "Saiyaara Full Song  Ek Tha Tiger",
        artist: "Mohit Chauhan, Tarannum, Sohail Sen",
        album: "Bollywood Songs",
        duration: "3:30",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986668/ZMusic/songs/yc5my7jv1zhpcr0araep.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986547/ZMusic/images/lw9lukfz01nuxnt1tgun.jpg",
    },
    {
        id: 21,
        title: "Cheema Y - Intro (Official Audio) ",
        artist: "Cheema Y | Gur Sidhu",
        album: "Punjabi Songs",
        duration: "2:37",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761991531/ZMusic/songs/xxbnyf1excpgqkxmn5ng.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986498/ZMusic/images/h3jgfwywl6stdovy31nb.jpg",
    },
    {
        id: 22,
        title: "Pasandida Aurat",
        artist: "Akhil and Nirmaan",
        album: "Punjabi Songs",
        duration: "3:48",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986647/ZMusic/songs/cybicbfyfkf8md4t6cti.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986539/ZMusic/images/cqoec4ndnxgfowxil95h.jpg",
    },
    {
        id: 23,
        title: "Shree Hanuman Chalisa",
        artist: "Shankar Mahadevan",
        album: "Bhakti Songs",
        duration: "11:36",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986711/ZMusic/songs/z4efkwwipdoao4gkzwzt.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986509/ZMusic/images/zwkjuwerkq6rtfthp2uv.jpg",
    },
    {
        id: 24,
        title: "A.R. Rahman - Tum Tak",
        artist: "Javed Ali, Keerthi Sagathia, and Pooja Vaidyanath",
        album: "Bollywood Songs",
        duration: "5:03",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986559/ZMusic/songs/veninraxxaewafdhlvs3.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986558/ZMusic/images/cgj4bl917ulawhyd3yau.jpg",
    },
    {
        id: 25,
        title: "Jinde Meriye",
        artist: "Prabh Gill",
        album: "Punjabi Songs",
        duration: "3:18",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761991617/ZMusic/songs/te2okukejh46qpoatolg.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761991460/ZMusic/images/h25epg3j7ikpkx8etpy6.jpg",
    },
    {
        id: 26,
        title: "Thoda Thoda Pyaar",
        artist: "Kumaar, Nilesh Ahuja, and Stebin Ben",
        album: "Bollywood Songs",
        duration: "4:32",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986699/ZMusic/songs/oqvxwo8n2lmfey5u7fxu.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986555/ZMusic/images/yd1rqqxaopilylc8t69f.jpg",
    },
    {
        id: 27,
        title: "Tu Hukam Taan Karda ve ",
        artist: "Parmish Verma",
        album: "Punjabi Songs",
        duration: "6:50",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986702/ZMusic/songs/s0ofhsx8xxwjco5farrl.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986556/ZMusic/images/ymrw48owuxjyhxmdyxy5.jpg",
    },
    {
        id: 28,
        title: "Tujh Mein Rab Dikhta Hai ",
        artist: "Roopkumar Rathod",
        album: "Bollywood Songs",
        duration: "4:41",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986704/ZMusic/songs/whfzdpgcsji7rhseu7i0.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986557/ZMusic/images/vnyybmcovm3dtjioehwh.jpg",
    },
    {
        id: 29,
        title: "Sheera Jasvir Jatt Sikka",
        artist: "Sheera Jasvir",
        album: "Punjabi Songs",
        duration: "3:38",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986673/ZMusic/songs/rhnclygvmhjfnqui62rr.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986548/ZMusic/images/nu3e02xapsyl9b48ce0v.jpg",
    },
    {
        id: 30,
        title: "The Medley Song  Mujhse Dosti Karoge ",
        artist: " Lata Mangeshkar, Pamela Chopra, Sonu Nigam, Udit Narayan",
        album: "Bollywood Songs",
        duration: "12:10",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986696/ZMusic/songs/guvhncimvdstrd5wfqpk.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986554/ZMusic/images/wrdusffhvubyn2sdiz08.jpg",
    },
    {
        id: 31,
        title: "Teri Jhaki Ke Ma Gola Maru",
        artist: " Masoom Sharma  Amanraj Gill  Sonika Singh ",
        album: "Haryanvi Songs",
        duration: "3:50",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986690/ZMusic/songs/g0pkrdqjhstmh8otccox.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986553/ZMusic/images/m9rq6q6tbdjewty3m56r.jpg",
    },
    {
        id: 32,
        title: "Mann Basgi ",
        artist: "Sinta Bhai",
        album: "Haryanvi Songs",
        duration: "3:29",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986625/ZMusic/songs/a3h7wjnmankpkzisdaf1.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986528/ZMusic/images/h4dvdor6k5xoptpfgldl.jpg",
    },
    {
        id: 33,
        title: "Mann Basgi 2 ",
        artist: "Sinta Bhai",
        album: "Haryanvi Songs",
        duration: "3:44",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986627/ZMusic/songs/z13mgyhlgazo3xm0zmba.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986528/ZMusic/images/eglpjltyadevb3xy0pdg.jpg",
    },
    {
        id: 34,
        title: "Pagal Banawe",
        artist: "Sinta Bhai",
        album: "Haryanvi Songs",
        duration: "3:42",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761986642/ZMusic/songs/hrze8ht0crviazlcsr1l.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761986537/ZMusic/images/lmmv4vumvcxdhszqssgo.jpg",
    },
    {
        id: 35,
        title: "Dhurandhar Title Track",
        artist: "Jasmine Sandlas, Hanumankind, Charanjit Ahuja",
        album: "Bollywood Songs",
        duration: "2:40",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990568/ZMusic/songs/euutlfp2gbtpmpitotjo.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990481/ZMusic/images/akyet4gg4u8my9fupmsq.jpg",
      },
      {
        id: 36,
        title: "Ab To Tera Intezaar",
        artist: "Maan Panu",
        album: "Heartbreak Songs",
        duration: "2:44",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990541/ZMusic/songs/nxj4f0ib0ty4k7sqmfyk.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990473/ZMusic/images/xc8qfi8oiuqflr90tawk.jpg",
      },
      {
        id: 37,
        title: "DEEWANIYAT",
        artist: "Vishal Mishra",
        album: "Bollywood Songs",
        duration: "4:17",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990565/ZMusic/songs/hpssigq4v0qg4czmsd38.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990481/ZMusic/images/bkgi72jcyzmh9bgkkxin.jpg",
      },
      {
        id: 38,
        title: "Ishq Bawla",
        artist: "Dhanda Nyoliwala",
        album: "Haryanvi Songs",
        duration: "4:32",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990588/ZMusic/songs/s47yz7u64dzgkemqeyix.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990489/ZMusic/images/icm2nmhwfqrpajsgr0gi.jpg",
      },
      {
        id: 39,
        title: "Dil Ka Jo Haal Hai",
        artist: "Abhijeet Bhattacharya, Shreya Ghoshal",
        album: "Bollywood Songs",
        duration: "3:42",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990572/ZMusic/songs/yuxjyofphmcf3naj5rqa.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990484/ZMusic/images/kxrtywmskjm67yzfjqij.jpg",
      },
      {
        id: 40,
        title: "AZUL",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:18",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990543/ZMusic/songs/eugg7kml15pljf5axxa5.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990475/ZMusic/images/luwksv7tbiwomnud04wq.jpg",
      },
      {
        id: 41,
        title: "QATAL",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:54",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990696/ZMusic/songs/kzaasgxzd9kdkcidd23r.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990516/ZMusic/images/rgaa8qg4ybrvjrcpf7nj.jpg",
      },
      {
        id: 42,
        title: "SIRRA",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "2:54",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990738/ZMusic/songs/qiy0arp79e26ztetmqoq.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990524/ZMusic/images/sk6olspauhwtq0oo4mh8.jpg",
      },
      {
        id: 43,
        title: "IKK MUNDA",
        artist: "SHEERA JASVIR",
        album: "Punjabi Songs",
        duration: "4:48",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990581/ZMusic/songs/lehf3oarq6ogy46cslb2.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990486/ZMusic/images/dbbq6ui002othp7qhtun.jpg",
      },
      {
        id: 44,
        title: "Itna Na Mujh Se Tu",
        artist: "Asha Parekh, Sunil Dutt",
        album: "90's Songs",
        duration: "7:38",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761992141/ZMusic/songs/lurz7ex5wp7cj1a0dgn8.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990490/ZMusic/images/biftvamegcihph8oub5m.jpg",
      },
      {
        id: 45,
        title: "Maruti",
        artist: "Dhanda Nyoliwala",
        album: "Haryanvi Songs",
        duration: "4:05",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990657/ZMusic/songs/vvujtmzubeb82e400a7r.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990506/ZMusic/images/fwg0pw97oeslppthlpwl.jpg",
      },
      {
        id: 46,
        title: "Mera Ji Lage Baba Mein",
        artist: "Raj Mawar, Aman Jaji, Mukesh Jaji",
        album: "Haryanvi Songs",
        duration: "3:26",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990667/ZMusic/songs/b8tq7n3vwlsrkrqmu8wa.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990508/ZMusic/images/ssbabp0kyjswwuit61kv.jpg",
      },
      {
        id: 47,
        title: "Om Namo Bhagavate",
        artist: "Sanjith Hegde, Vijay Prakash",
        album: "Bhakti Songs",
        duration: "3:32",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990670/ZMusic/songs/sempaxlwzicwaebgdfub.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990509/ZMusic/images/kvvxnkxqqd0uewf36aiz.jpg",
      },
      {
        id: 48,
        title: "Pardesiya - Param Sundari",
        artist: "Sachin-Jigar, Sonu Nigam, Krishnakali",
        album: "Bollywood Songs",
        duration: "2:58",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990678/ZMusic/songs/vvjrodfezyrabrfwy0ug.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990512/ZMusic/images/satwcwhgrfyr6cclxagr.jpg",
      },
      {
        id: 49,
        title: "PERFECT",
        artist: "GURU RANDHAWA",
        album: "Punjabi Songs",
        duration: "3:15",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990687/ZMusic/songs/sdgrpyph78zh4dfdcepl.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990514/ZMusic/images/cdo7har1zp6fqsh1oure.jpg",
      },
      {
        id: 50,
        title: "Radha Gori Gori",
        artist: "Indresh Upadhyay, B Praak",
        album: "Bhakti Songs",
        duration: "5:54",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990708/ZMusic/songs/mhymzkb0jmuhu3hnupil.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990518/ZMusic/images/lujyr6pgdcb8iamkpgpf.jpg",
      },
      {
        id: 51,
        title: "Sahiba",
        artist: "Aditya Rikhari, Ankita Chhetri",
        album: "Hindi Songs",
        duration: "3:04",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990718/ZMusic/songs/v5euxhlqcpuyyh5pfqsn.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990520/ZMusic/images/uycdlceydwmj2ovrcdbp.jpg",
      },
      {
        id: 52,
        title: "Tere Vaaste",
        artist: "Sachin-Jigar, Divya Kumar, Zara Khan",
        album: "Bollywood Songs",
        duration: "3:18",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990762/ZMusic/songs/eeoaddgo7odusx6a4j4p.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990526/ZMusic/images/n1i2n9l1efngywmusrxy.jpg",
      },
      {
        id: 53,
        title: "Lut Gaye",
        artist: "Jubin Nautiyal, Emraan Hashmi",
        album: "Bollywood Songs",
        duration: "3:48",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990632/ZMusic/songs/heb5xepbpoo5dzgp5c66.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990500/ZMusic/images/kfkb8grz2oxqd1nkmaxe.jpg",
      },
      {
        id: 54,
        title: "Raatan Lambiyan",
        artist: "Tanishk Bagchi, Jubin Nautiyal, Asees Kaur",
        album: "Bollywood Songs",
        duration: "3:50",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990700/ZMusic/songs/ynh6hccwst5boptw2dto.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990517/ZMusic/images/ok34bahsexplwdjfrces.jpg",
      },
      {
        id: 55,
        title: "Kesariya",
        artist: "Arijit Singh, Amitabh Bhattacharya",
        album: "Bollywood Songs",
        duration: "4:28",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761991635/ZMusic/songs/vltdx16szuy1awc0vraa.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990497/ZMusic/images/kad0taejp8m4uqhrzhza.jpg",
      },
      {
        id: 56,
        title: "Mann Bharrya",
        artist: "B Praak, Jaani",
        album: "Bollywood Songs",
        duration: "4:07",
        audio: "https://res.cloudinary.com/dmptasnm8/video/upload/v1761990651/ZMusic/songs/evoqs99dygvzymbm2epm.mp3",
        image: "https://res.cloudinary.com/dmptasnm8/image/upload/v1761990504/ZMusic/images/wjfulxsgk3xtam5i5dgd.jpg",
      },
];

const validateSongs = () => {
  const valid = [];
  const invalid = [];

  songs.forEach((song, i) => {
    const hasAllFields = song.title && song.artist && song.image && song.audio;
    const audioOk = song.audio.endsWith(".mp3") || song.audio.endsWith(".mp4");

    if (hasAllFields && audioOk) {
      valid.push(song);
    } else {
      invalid.push({
        index: i + 1,
        reason: `Invalid or missing fields: ${JSON.stringify(song, null, 1)}`
      });
    }
  });

  return { valid, invalid };
};

const seedData = async () => {
  console.log("🚀 Starting MongoDB seed for songs...");

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB Atlas");

    const { valid, invalid } = validateSongs();
    console.log(`\n📊 Total Songs: ${songs.length}`);
    console.log(`✅ Valid Songs: ${valid.length}`);
    console.log(`⚠️ Invalid Songs: ${invalid.length}`);

    if (invalid.length > 0) {
      console.log("\n❌ Skipped invalid songs:");
      invalid.forEach((err) => console.log("-", err.reason));
    }

    await Song.deleteMany({});
    console.log("🧹 Cleared old songs collection...");

    await Song.insertMany(valid);
    console.log(`🎉 Inserted ${valid.length} songs successfully!`);

    const dbStatus = getConnectionStatus();
    console.log(`\n📈 Connected: ${dbStatus.connected}, DB: ${dbStatus.name}`);

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
    process.exit(0);
  }
};

// Run automatically
seedData();
