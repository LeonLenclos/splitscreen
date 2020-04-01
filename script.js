// Léon 2020 http://leonlenclos.net/contact

let loaded_videos = 0;
let playing = false;

const toggle_play = (video) => {
    // Play or pause a video.
    if(playing) video.play();
    else video.pause();
};

const on_everything_ready = () => {
    // Enable the play button and remove the loading message;
    document.querySelector("#play").disabled = false;
    document.querySelector("#loading").style.display = 'none';
};

const on_video_ready = (e) => {
    // Pause and mute the video. Then, wait untill everything is ready.
    e.target.pause();
    e.target.muted=true;
    loaded_videos++;
    if(loaded_videos == document.querySelectorAll('video').length) {
        on_everything_ready()
    }
};

const on_play = (e) => {
    // Toogle play, for each video and for the play button.
    playing = !playing;
    e.target.textContent = playing ? 'play' : 'pause';
    document.querySelectorAll(".on-air").forEach(toggle_play);
};

const on_select = (e) => {
    // Mute each videos. Unmute and add selected class to the choosen video.
    document.querySelectorAll('video.on-air').forEach((video) => {
        video.muted = true;
        video.parentElement.classList.remove('selected');
    });
    e.target.muted = false;
    e.target.parentElement.classList.add('selected');
    console.log(e.target.id, "-> selected")
};

const on_info = (e) => {
    // Toogle the visibility of the info box.
    document.querySelector('#info').classList.toggle('invisible');
};

const load = () => {
    // Reload each video
    loaded_videos = 0;
    document.querySelector('#play').disabled = true;
    document.querySelector("#loading").classList.remove('invisible');
    document.querySelectorAll('video').forEach((video) => {
        video.load();
        video.addEventListener('canplay', on_video_ready, {once: true});
    });
};

// Setup Buttons.
let play_button = document.querySelector('#play');
let info_button = document.querySelector('#open-info');
let reload_button = document.querySelector('#reload');
play_button.addEventListener('click', on_play)
info_button.addEventListener('click', on_info)
reload_button.addEventListener('click', load)

// When the user click on a screen it takes the focus.
document.querySelectorAll('video').forEach((video) => {
    video.addEventListener('click', on_select);
});

// The 'bano' sequence is in two parts. When the fitst part ends, the second part starts and loops forever.
let bano_a = document.querySelector('#bano-a');
let bano_b = document.querySelector('#bano-b');
bano_a.addEventListener('ended', (e)=>{
    bano_a.classList.toggle('on-air');
    bano_b.classList.toggle('on-air');
    toggle_play(bano_a);
    toggle_play(bano_b);
})


// Go !
load();