// Léon 2021 http://leonlenclos.net/contact ('<_ '

"use strict";

const ALLOWED_OFFSET = 2;// This is the allowed offset between sync videos (in seconds).
const REWIND_INTERVAL_DURATION = 1;// (in seconds).
const DEFAULT_SPEED = 0;
const DEFAULT_QUALITY = '720p';
const DEFAULT_LANG = 'es';

let urlParams =  new URLSearchParams(window.location.search);
let loaded_videos = 0;
let playing_speed = DEFAULT_SPEED;
let playing_sub_lang = urlParams.get('lang') || DEFAULT_LANG;
let playing_quality = DEFAULT_QUALITY;
let last_sync_time = undefined;

let reverse_interval = null;


const toggle_play = (video) => {
    // Play or pause a video.
    if(playing){
        video.play();
    }
    else {
        video.pause();
    }
};



const on_video_canplay = (e) => {
    // Wait untill everything is ready.
    loaded_videos++;
    let total_videos = document.querySelectorAll('video').length;
    console.log(e.target.src, '-> READY ('+loaded_videos+'/'+total_videos+')');
    if(loaded_videos == total_videos) {
        on_everything_ready();
    }
};

const on_play = (e) => {
    // Toggle play, for each video and for the play button.
    playing = !playing;
    e.target.textContent = playing ? 'pause' : 'play';
    document.querySelectorAll(".on-air").forEach(toggle_play);
    if(playing) document.querySelector('#info').classList.add('invisible');
};

const on_select = (e) => {
    // Mute each videos. Unmute and add selected class to the choosen video.
    document.querySelectorAll('video.on-air').forEach((video) => {
        video.muted = true;
        video.parentElement.classList.remove('selected');
    });
    e.target.muted = false;
    e.target.parentElement.classList.add('selected');
    console.log(e.target.src, '-> SELECTED');
};

const on_info = (e) => {
    // Toogle the visibility of the info box.
    document.querySelector('#info').classList.toggle('invisible');

};



const reload_at_same_time = () => {
    document.querySelectorAll('video.on-air').forEach((video) => {
        let time = video.currentTime;
        video.load();
        video.currentTime = time;
    });
};

const set_text_track = () => {
    document.querySelectorAll('video').forEach((video) => {
        video.textTrack 
        for (var i = 0; i < video.textTracks.length; i++) {
            if(video.textTracks[i].language == playing_sub_lang) {
                video.textTracks[i].mode = 'showing';
            } else {
                video.textTracks[i].mode = 'hidden';
            }
        }
    });
};

const set_speed = (speed) => {
    let on_air = document.querySelectorAll(".on-air")
    clearInterval(reverse_interval);
    if(speed == 0){
        on_air.forEach((video)=>{
            video.pause();
        });
    }
    else{
        if(speed > 0){
            on_air.forEach((video)=>{
                video.playbackRate = speed;
            });
        }
        else if(speed < 0){
            on_air.forEach((video)=>{
                video.playbackRate = 0;
            });
            reverse_interval = setInterval(()=>{
                on_air.forEach((video)=>{
                    video.currentTime = video.currentTime + REWIND_INTERVAL_DURATION*speed;
                });
            }, REWIND_INTERVAL_DURATION*1000);
        }
        on_air.forEach((video)=>{
            video.play().catch((e)=>{
               console.log('PLAY ERROR', e)
            });
        });
    }
    playing_speed = speed;

};

const load = () => {
    // Reload each video
    loaded_videos = 0;
    // document.querySelector('#play').disabled = true;
    // document.querySelector('#play').textContent = 'play';
    // document.querySelector("#loading").classList.remove('invisible');
    document.querySelectorAll('video').forEach((video) => {
        // 'canplaythrough' event may be better
        console.log(video.src, '-> LOAD');
        video.addEventListener('canplay', on_video_canplay, {once:true});
        video.load();
    });
};

const on_speed = (event)=>{
    let speed = Number(event.target.dataset.speed);
    set_speed(speed);
}

const on_location = (event)=>{
    let page = event.target.dataset.page + '?lang=' + playing_sub_lang;
    console.log('ON LOCATION', page)
    window.location.href = page;
}

const on_fullscreen = (event)=>{
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen(); 
        }
    }
}

const toogle_setting_panel = ()=>{
    let settings = document.getElementById("settings");
    if (settings.style.display == "flex") {
        settings.style.display = "none";
    } else {
        settings.style.display = "flex";
    }
}


const update_buttons = (event)=>{
    let speed_buttons = document.querySelectorAll('#controls button[data-action=speed]');
    let quality_buttons = document.querySelectorAll('#settings button[data-action=quality]');
    let subtitles_buttons = document.querySelectorAll('#settings button[data-action=subtitles]');
    speed_buttons.forEach((button)=>{
        button.disabled = Number(button.dataset.speed) == playing_speed;
    });
    quality_buttons.forEach((button)=>{
        button.disabled = button.dataset.quality == playing_quality;
    });
    subtitles_buttons.forEach((button)=>{
        button.disabled = button.dataset.lang == playing_sub_lang;
    });
}

const on_settings = (event)=>{
    toogle_setting_panel();
}
const on_quality = (event)=>{
    playing_quality = event.target.dataset.quality;
    set_sources();
    reload_at_same_time();
    toogle_setting_panel();
}


const on_subtitles = (event)=>{
    playing_sub_lang = event.target.dataset.lang;
    set_text_track();
    toogle_setting_panel();
    update_buttons();
    reload_at_same_time();
}

const on_everything_ready = () => {
    set_speed(1);
    update_buttons();
    // document.querySelector("#play").disabled = false;
    // document.querySelector("#loading").classList.add('invisible');
};


const play_next_video = (video) => {
    let next = video.nextElementSibling;
    console.log(video.src, '-> NEXT ('+next.src+')');
    if(next){
        video.classList.remove('on-air');
        next.classList.add('on-air');
        next.play();
    }
}
const restart_video = (video) => {
    video.currentTime=0;
    video.dataset.loop ++;
    video.play();
}

const set_sources = () => {
    document.querySelectorAll('video').forEach((video) => {
        let src_dir = 'src/day' + video.dataset.day + '/'
        let src = src_dir + playing_quality.slice(0,-1) + '/' + video.dataset.room + '.mp4';
        video.querySelectorAll('[kind=subtitles]').forEach((track) => {
            let src = src_dir + 'srt/' + track.srclang + '/' + video.dataset.room + '.vtt';
            track.src = src;
        });
        video.src = src;
    });
}

const setup_videos = () => {

    document.querySelectorAll('video:first-child').forEach((video)=>{
        // First video is on-air
        video.classList.add('on-air');
    });

    document.querySelectorAll('video').forEach((video)=>{
        // poster (for loading animation)
        video.setAttribute('poster', '');
        // When the user click on a video it takes the focus.
        video.addEventListener('click', on_select);
        // Loop iteration value (used by videos_sync)
        video.dataset.loop=0;
    });

    document.querySelectorAll('.loop').forEach((video)=>{
        video.addEventListener('ended', ()=>restart_video(video));
    });

    document.querySelectorAll('.once').forEach((video)=>{
        video.addEventListener('ended', ()=>play_next_video(video));
    });

    set_sources();
};

const setup_buttons = () => {
    // Setup buttons.
    let controls_buttons = document.querySelectorAll('#controls button, #settings button');
    controls_buttons.forEach((button)=>{
        switch (button.dataset.action) {
            case 'speed':
                button.addEventListener('click', on_speed);
                break;
            case 'location':
                button.addEventListener('click', on_location);
                break;
            case 'fullscreen':
                button.addEventListener('click', on_fullscreen);
                break;
            case 'settings':
                button.addEventListener('click', on_settings);
                break;
            case 'quality':
                button.addEventListener('click', on_quality);
                break;
            case 'subtitles':
                button.addEventListener('click', on_subtitles);
                break;
        }
        button.addEventListener('click', update_buttons);
    });

    update_buttons();

    // Disable speed buttons
    document.querySelectorAll('#speed button').forEach((button)=>{
        button.disabled = true;
    });
};


const videos_sync = (videos) => {
    // Sync only 'on-air' videos
    let onair_videos = videos.filter((video)=>video.classList.contains('on-air'));

    // choose the latest video to be the controller
    let controller = onair_videos.reduce((controller, video) => {
        if(video.currentTime < controller.currentTime){
            return video;
        }
        return controller;
    }, onair_videos[0]);


    if(last_sync_time == controller.currentTime){
        console.log(controller.src, '-> (SYNC) CONTROLLER LAG...');
        // onair_videos.forEach((video) => {
        //     video.currentTime = controller.currentTime;
        // });
        // reload_at_same_time();

        // last_sync_time = undefined;
    } else if(controller.currentTime){
        onair_videos.forEach((video) => {    
            // If a video is too far in advance from the controller
            // and is in the same loop iteration
            if (video.currentTime-controller.currentTime>ALLOWED_OFFSET
                && video.dataset.loop == controller.dataset.loop) {
                // synchronise
                console.log(video.src, '-> SYNC')
                video.currentTime = controller.currentTime;
                last_sync_time = controller.currentTime;
            }
        });
    }
    // Recursive loop on this function
    requestAnimationFrame(() => videos_sync(videos));
};

// Setup...
setup_buttons();
setup_videos();
videos_sync(Array.from(document.querySelectorAll('video.sync')));

// Go !
load();