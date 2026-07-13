0. Rewrite chess logic and moves so that those will be readable. [DONE]
    a> Check whether it works. [DONE]
    b> Fix promoting. Let the pawn upgrade to queen. [DONE]
    c> Fix it for the opponent [DONE].
1. Email confirmation (Jeśli w ogóle) 
2. 2 users playing:
    I)      Dodanie pokoju, w którym siedzą userzy. [DONE] (Pozbyć się bugów przy pairingu)
    I.V)    Podział backenda na pliki. [DONE]
    II)     Dodanie komunikacji WebSocket [DONE]
    III)    Dodanie ping pong w wsie + liczenie opóźnień i wywalanie playerów jak na lichess, animacja jak na chess.com. [LATER]
    IV)     Dodanie czasu [DONE]
    MV)     Daleka przyszlosc - dodanie komunikacji WebSocket + WebRTC żeby odciążyć serwer i przyspieszyć działanie
    MVI)    Daleka przyszlosc - user moze grać kilka partii na raz
4. Game history saved - moves saved. [DONE]
5. Ability to play without logging. 
6. Using only one boardSize (not 2 one in gameContext one in logContext). [DONE]
7. Bugs:
    a> dangling request in the homePage fetching for pairing constantly. [FIXED]
    b> No HTTP connection sometimes. [FIXED]
        I> The problem is with posting connections. [FIXED]
    d> Zablokować dostęp do game'a bez naciśnięcia play.
    f> Chessboard inactive after putting to a game. [FIXED]
    g> When click and unclick game mode, two players are black. [FIXED]
    h> White can move black piece using click move. [FIXED].
    i> Loading sign disappears at homePage after rerender. 
    j> InfoTab displays players in inversed order. [FIXED]
    h> premove time running for the wrong player bug. [NOW]
8. White moves only when it's his turn to do so [DONE].
9. Add premoves:
    a> Lichess alike premoves. [DONE]
    b> Rewrite PieceContainer.js to make it simplier. [DONE]
    c> Premove with moving piece. [DONE]
    d> Several premoves with one piece [NOW]. (Generalnioe problem jest taki ze nie wiadomo gdzie nasza figura stoi),
    e> Fix annoying problem with the piece disappearing after premove
    f> unconditional premoves.
    g> Stack all premoves including conditional premoves.
10. Add moves after clicking on a piece. [DONE]
11. Change logging layout - it's quite ugly.
12. After start dragging piece is centered. [DONE]
13. Move highlighting. [DONE]
14. Animations after opponent move.
15. Square gets red after right click. [DONE]
16. Drawing arrows over the chessboard. onMouseDown + onMouseUp - in mother component Game.js
17. HOC from making moves. [DONE]
18. This.context is undefined sometimes in the Piece component RACING CONDITIONS likely. [UGLY_SOLVE]
19. Add option for 2 annonymous player to play.


X. What to add in infoTab
    Username/Nickname;
    Country/Location
    Rating/Elo Score
    Customization/Avatar
    Age
    Gender
    Playing History
    Preferred Time Controls
    Favorite Openings
    Activity Patterns
    Languages Spoken
    Profile Bio/Interests
    Friends/Followers Count
    Last Active Timestamp
    Preferred Chess Variants
    Device/Platform Used
    Achievements/Awards
    Communication Style
    Timezone
    Account Age