package umm3601.doorboard;

import org.mongojack.Id;
import org.mongojack.ObjectId;

public class DoorBoard {

  @ObjectId @Id
  public String _id;

  // Information about the owner of this DoorBoard
  public String name;
  public String email;
  public String building;
  public String officeNumber;

  // The Auth0 id of the owner of this DoorBoard.
  // ("sub" is the abbreviation Auth0 uses for "subject".)
  public String sub;
}
