package fu.sba302.controller;

import fu.sba302.dto.RoomDTO;
import fu.sba302.dto.RoomTypeDTO;
import fu.sba302.service.RoomService;
import fu.sba302.service.RoomTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * @author HuyTran - SE1910
 */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    private final RoomService roomService;
    private final RoomTypeService roomTypeService;

    public PublicController(RoomService roomService, RoomTypeService roomTypeService) {
        this.roomService = roomService;
        this.roomTypeService = roomTypeService;
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomDTO>> getAvailableRooms() {
        return ResponseEntity.ok(roomService.getActiveRooms());
    }

    @GetMapping("/rooms/{id}")
    public ResponseEntity<RoomDTO> getRoomById(@PathVariable Integer id) {
        return ResponseEntity.ok(roomService.getRoomById(id));
    }

    @GetMapping("/room-types")
    public ResponseEntity<List<RoomTypeDTO>> getAllRoomTypes() {
        return ResponseEntity.ok(roomTypeService.getAllRoomTypes());
    }
}

