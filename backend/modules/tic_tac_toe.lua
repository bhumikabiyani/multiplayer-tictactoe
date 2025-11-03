local nk = require("nakama")

local M = {}

-- Match handler for Tic-Tac-Toe
local function match_init(context, initial_state)
    local state = {
        board = {"", "", "", "", "", "", "", "", ""},
        current_player = "X",
        players = {},
        winner = nil,
        game_over = false
    }
    
    local tick_rate = 1 -- 1 tick per second
    local label = "Tic-Tac-Toe Match"
    
    return state, tick_rate, label
end

local function match_join_attempt(context, dispatcher, tick, state, presence, metadata)
    -- Allow up to 2 players
    if #state.players >= 2 then
        return state, false, "Match is full"
    end
    
    return state, true
end

local function match_join(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do
        -- Count current players
        local current_player_count = 0
        for _ in pairs(state.players) do
            current_player_count = current_player_count + 1
        end
        
        -- Assign player symbol (X or O)
        local symbol = current_player_count == 0 and "X" or "O"
        
        state.players[presence.user_id] = {
            presence = presence,
            symbol = symbol
        }
        
        -- Count players after adding
        local new_player_count = 0
        for _ in pairs(state.players) do
            new_player_count = new_player_count + 1
        end
        
        -- Notify all players about the new player
        local message = {
            type = "player_joined",
            player_id = presence.user_id,
            symbol = symbol,
            players_count = new_player_count
        }
        
        dispatcher.broadcast_message(1, nk.json_encode(message))
        
        -- If we have 2 players, start the game
        if new_player_count == 2 then
            local start_message = {
                type = "game_start",
                current_player = state.current_player,
                board = state.board
            }
            dispatcher.broadcast_message(1, nk.json_encode(start_message))
        end
    end
    
    return state
end

local function match_leave(context, dispatcher, tick, state, presences)
    for _, presence in ipairs(presences) do
        state.players[presence.user_id] = nil
        
        -- Notify remaining players
        local message = {
            type = "player_left",
            player_id = presence.user_id
        }
        dispatcher.broadcast_message(1, nk.json_encode(message))
    end
    
    return state
end

local function check_winner(board)
    -- Check rows
    for i = 1, 7, 3 do
        if board[i] and board[i] ~= "" and board[i] == board[i+1] and board[i] == board[i+2] then
            return board[i]
        end
    end
    
    -- Check columns
    for i = 1, 3 do
        if board[i] and board[i] ~= "" and board[i] == board[i+3] and board[i] == board[i+6] then
            return board[i]
        end
    end
    
    -- Check diagonals
    if board[1] and board[1] ~= "" and board[1] == board[5] and board[1] == board[9] then
        return board[1]
    end
    if board[3] and board[3] ~= "" and board[3] == board[5] and board[3] == board[7] then
        return board[3]
    end
    
    -- Check for tie
    local is_full = true
    for i = 1, 9 do
        if not board[i] or board[i] == "" then
            is_full = false
            break
        end
    end
    
    if is_full then
        return "tie"
    end
    
    return nil
end

local function match_loop(context, dispatcher, tick, state, messages)
    for _, message in ipairs(messages) do
        local decoded = nk.json_decode(message.data)
        local sender_id = message.sender.user_id
        
        if decoded.type == "move" and not state.game_over then
            local player = state.players[sender_id]
            
            -- Validate move
            if player and player.symbol == state.current_player then
                local position = decoded.position
                
                if position >= 1 and position <= 9 and (not state.board[position] or state.board[position] == "") then
                    -- Make the move
                    state.board[position] = player.symbol
                    
                    -- Check for winner
                    local winner = check_winner(state.board)
                    if winner then
                        state.winner = winner
                        state.game_over = true
                    else
                        -- Switch player
                        state.current_player = state.current_player == "X" and "O" or "X"
                    end
                    
                    -- Broadcast the move
                    local move_message = {
                        type = "move_made",
                        position = position,
                        symbol = player.symbol,
                        board = state.board,
                        current_player = state.current_player,
                        winner = state.winner,
                        game_over = state.game_over
                    }
                    
                    dispatcher.broadcast_message(1, nk.json_encode(move_message))
                end
            end
        elseif decoded.type == "reset_game" then
            -- Reset the game state
            state.board = {nil, nil, nil, nil, nil, nil, nil, nil, nil}
            state.current_player = "X"
            state.winner = nil
            state.game_over = false
            
            local reset_message = {
                type = "game_reset",
                board = state.board,
                current_player = state.current_player
            }
            
            dispatcher.broadcast_message(1, nk.json_encode(reset_message))
        end
    end
    
    return state
end

local function match_terminate(context, dispatcher, tick, state, grace_seconds)
    return state
end

local function match_signal(context, dispatcher, tick, state, data)
    return state, data
end

-- Register the match handler
nk.register_matchmaker_matched(function(context, matched_users)
    return nk.match_create("tic_tac_toe", {})
end)

-- Register match handler
M.match_init = match_init
M.match_join_attempt = match_join_attempt
M.match_join = match_join
M.match_leave = match_leave
M.match_loop = match_loop
M.match_terminate = match_terminate
M.match_signal = match_signal

return M